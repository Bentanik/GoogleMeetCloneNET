import * as mediasoup from "mediasoup";
import Redis from "ioredis";
import { log } from "@/utils/helper";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
});
// Participant interface
export interface Participant {
  id: string;
  displayName: string;
  transports: Map<string, mediasoup.types.WebRtcTransport>;
  producers: Map<string, mediasoup.types.Producer>;
  consumers: Map<string, mediasoup.types.Consumer>;
}

// Room state interface
export interface RoomState {
  code: string;
  router: mediasoup.types.Router;
  participants: Map<string, Participant>;
}

// In-memory rooms and workers
export const rooms = new Map<string, RoomState>();
let workers: mediasoup.types.Worker[] = [];
let nextWorkerIdx = 0;

// Initialize Mediasoup workers
export async function initMediasoup() {
  const numWorkers = require("os").cpus().length;
  log(`Creating ${numWorkers} Mediasoup workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const worker: mediasoup.types.Worker = await mediasoup.createWorker({
      logLevel: "warn",
      rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || "40000"),
      rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT || "40100"),
    });

    worker.on("died", () => {
      console.error(`Mediasoup worker ${i} died, exiting...`);
      process.exit(1);
    });

    workers.push(worker);
  }

  log(`Mediasoup: ${workers.length} workers ready`);
}

// Round-robin worker selection
export function getNextWorker(): mediasoup.types.Worker {
  const worker = workers[nextWorkerIdx];
  nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
  return worker;
}

// Get or create a room
export async function getOrCreateRoom(roomCode: string): Promise<RoomState> {
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
    ],
  });

  room = { code: roomCode, router, participants: new Map() };
  rooms.set(roomCode, room);
  log(`Created router for room ${roomCode}`);

  return room;
}
