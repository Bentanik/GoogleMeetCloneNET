import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { Server } from "socket.io";
import { createServer } from "http";
import { buildSwaggerSpec } from "@/config/swagger";
import indexRouter from "@/routes";
import { RedisHelper } from "@/redis/helper";
import {
  initMediasoup,
  getRouter,
  createTransport,
  connectTransport,
  produce,
  consume,
  getProducerIds,
  cleanupPeer,
  cleanupRoom,
} from "@/mediasoup/worker";
import {
  JoinRoomRequest,
  CreateTransportRequest,
  ConnectTransportRequest,
  ProduceRequest,
  ConsumeRequest,
} from "@/types";
import { log } from "@/utils/helper";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  path: "/socket.io/",
});

app.use(bodyParser.json());

const swaggerSpec = buildSwaggerSpec();
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", indexRouter);

const redisHelper = new RedisHelper(
  process.env.REDIS_HOST || "localhost",
  parseInt(process.env.REDIS_PORT || "6379"),
  process.env.REDIS_USERNAME || undefined,
  process.env.REDIS_PASSWORD || undefined
);

io.on("connection", (socket) => {
  log(`Client connected: ${socket.id}`);

  socket.on(
    "joinRoom",
    async (
      request: JoinRoomRequest,
      callback: (response: {
        success: boolean;
        error?: string;
        participantCount?: number;
        room?: any;
        rtpCapabilities?: any;
      }) => void
    ) => {
      try {
        const roomJson = await redisHelper.getRoomJson(request.roomCode);
        if (!roomJson) {
          return callback({ success: false, error: "Room not found" });
        }

        const room: any = JSON.parse(roomJson);
        const count = await redisHelper.incrementParticipantCount(
          request.roomCode
        );
        room.participantCount = count;

        const router = await getRouter(request.roomCode);
        socket.join(request.roomCode);
        socket
          .to(request.roomCode)
          .emit("newParticipant", { peerId: socket.id });
        socket.emit("roomJoined", {
          room,
          rtpCapabilities: router.rtpCapabilities,
        });

        const producers = getProducerIds(request.roomCode);
        socket.emit("existingProducers", producers);

        callback({ success: true, participantCount: count });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "createTransport",
    async (
      request: CreateTransportRequest,
      callback: (response: {
        success: boolean;
        error?: string;
        id?: string;
        iceParameters?: any;
        iceCandidates?: any;
        dtlsParameters?: any;
      }) => void
    ) => {
      try {
        const transport = await createTransport(
          request.roomCode,
          socket.id,
          request
        );
        callback({
          success: true,
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "connectTransport",
    async (
      request: ConnectTransportRequest,
      callback: (response: { success: boolean; error?: string }) => void
    ) => {
      try {
        await connectTransport(request.roomCode, socket.id, request);
        callback({ success: true });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "produce",
    async (
      request: ProduceRequest,
      callback: (response: {
        success: boolean;
        error?: string;
        id?: string;
      }) => void
    ) => {
      try {
        const producerId = await produce(request.roomCode, socket.id, request);
        socket
          .to(request.roomCode)
          .emit("newProducer", { producerId, kind: request.kind });
        callback({ success: true, id: producerId });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "consume",
    async (
      request: ConsumeRequest,
      callback: (response: {
        success: boolean;
        error?: string;
        id?: string;
        producerId?: string;
        kind?: string;
        rtpParameters?: any;
      }) => void
    ) => {
      try {
        const consumer = await consume(request.roomCode, socket.id, request);
        callback({
          success: true,
          id: consumer.id,
          producerId: request.producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "leaveRoom",
    async (
      roomCode: string,
      callback: (response: {
        success: boolean;
        error?: string;
        participantCount?: number;
      }) => void
    ) => {
      try {
        const count = await redisHelper.decrementParticipantCount(roomCode);
        cleanupPeer(roomCode, socket.id);
        socket.leave(roomCode);
        socket.to(roomCode).emit("participantLeft", { peerId: socket.id });

        if (count === 0) {
          cleanupRoom(roomCode);
        }

        callback({ success: true, participantCount: count });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on("disconnect", async () => {
    log(`Client disconnected: ${socket.id}`);
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
    for (const roomCode of rooms) {
      const count = await redisHelper.decrementParticipantCount(roomCode);
      cleanupPeer(roomCode, socket.id);
      socket.to(roomCode).emit("participantLeft", { peerId: socket.id });
      if (count === 0) {
        cleanupRoom(roomCode);
      }
    }
  });
});

export default httpServer;
