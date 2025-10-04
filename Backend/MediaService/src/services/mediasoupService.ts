import { Server as SocketIO } from "socket.io";
const mediasoup: any = require("mediasoup");
const Redis: any = require("ioredis");

// Minimal, clean mediasoup service implementation
type LooseMap<T> = Map<string, T>;

interface RoomState {
  code: string;
  router: any;
  participants: LooseMap<any>;
}

interface Participant {
  id: string;
  displayName: string;
  transports: LooseMap<any>;
  producers: LooseMap<any>;
  consumers: LooseMap<any>;
}

const rooms = new Map<string, RoomState>();
let workers: any[] = [];
let nextWorkerIdx = 0;

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

export async function initMediasoup() {
  const numWorkers = require("os").cpus().length;
  console.log(`🔧 Creating ${numWorkers} Mediasoup workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: "warn",
      rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || "40000", 10),
      rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT || "40100", 10),
    });

    worker.on("died", () => {
      console.error(`❌ Mediasoup worker ${i} died, exiting...`);
      process.exit(1);
    });

    workers.push(worker);
  }

  console.log(`✅ Mediasoup: ${workers.length} workers ready`);
}

function getNextWorker() {
  const worker = workers[nextWorkerIdx];
  nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
  return worker;
}

export async function getOrCreateRoom(
  roomCode: string
): Promise<RoomState | null> {
  const roomExists = await redis.exists(`room:${roomCode}`);
  if (!roomExists) return null;

  let room = rooms.get(roomCode);
  if (room) return room;

  const worker = getNextWorker();
  const router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: { "x-google-start-bitrate": 1000 },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: { "profile-id": 2 },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: { "packetization-mode": 1, "profile-level-id": "42e01f" },
      },
    ],
  });

  room = { code: roomCode, router, participants: new Map() };
  rooms.set(roomCode, room);
  console.log(`📺 Created router for room ${roomCode}`);
  return room;
}

export function attachSocketHandlers(httpServer: any) {
  const io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket: any) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("ping", (cb: any) => cb && cb("pong"));
  });
}

export function getStats() {
  return { rooms: rooms.size, workers: workers.length };
}

export default {
  initMediasoup,
  attachSocketHandlers,
  getOrCreateRoom,
  getStats,
};
import express from "express";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import Redis from "ioredis";
import * as mediasoup from "mediasoup";
import {
  Worker,
  Router,
  WebRtcTransport,
  Producer,
  Consumer,
} from "mediasoup/node/lib/types";

// Types
interface RoomState {
  code: string;
  router: Router;
  participants: Map<string, Participant>;
}

interface Participant {
  id: string;
  displayName: string;
  transports: Map<string, WebRtcTransport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
}

// In-memory storage
const rooms = new Map<string, RoomState>();
let workers: Worker[] = [];
let nextWorkerIdx = 0;

// Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// ============================================
// Initialize Mediasoup
// ============================================
export async function initMediasoup() {
  const numWorkers = require("os").cpus().length;

  console.log(`🔧 Creating ${numWorkers} Mediasoup workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: "warn",
      rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || "40000"),
      rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT || "40100"),
    });

    worker.on("died", () => {
      console.error(`❌ Mediasoup worker ${i} died, exiting...`);
      process.exit(1);
    });

    workers.push(worker);
  }

  console.log(`✅ Mediasoup: ${workers.length} workers ready`);
}

function getNextWorker(): Worker {
  const worker = workers[nextWorkerIdx];
  nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
  return worker;
}

export async function getOrCreateRoom(
  roomCode: string
): Promise<RoomState | null> {
  // Check if room exists in Redis (created by .NET API)
  const roomExists = await redis.exists(`room:${roomCode}`);
  if (!roomExists) {
    return null;
  }

  // Check in-memory cache
  let room = rooms.get(roomCode);
  if (room) {
    return room;
  }

  // Create new router for this room
  const worker = getNextWorker();
  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
        },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
        },
      },
    ],
  });

  room = {
    code: roomCode,
    router,
    participants: new Map(),
  };

  rooms.set(roomCode, room);
  console.log(`📺 Created router for room ${roomCode}`);

  return room;
}

export function getRoomsCount() {
  return rooms.size;
}

export function getWorkersCount() {
  return workers.length;
}

export default {
  initMediasoup,
  getOrCreateRoom,
  getRoomsCount,
  getWorkersCount,
};
