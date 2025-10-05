import { Server as SocketIO } from "socket.io";
import {
  getOrCreateRoom,
  redis,
  Participant,
} from "@/mediasoup/mediasoupHandler";
import { log } from "@/utils/helper";

export function initSocket(httpServer: any) {
  const io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    log(`Socket connected: ${socket.id}`);

    let participant: Participant | null = null;
    let currentRoom: any = null;

    // JOIN ROOM
    socket.on(
      "join-room",
      async (data: { roomCode: string; displayName: string }, callback) => {
        const room = await getOrCreateRoom(data.roomCode);

        participant = {
          id: socket.id,
          displayName: data.displayName,
          transports: new Map(),
          producers: new Map(),
          consumers: new Map(),
        };
        room.participants.set(socket.id, participant);
        currentRoom = room;
        socket.join(data.roomCode);
        await redis.set(
          `room:${data.roomCode}:participants`,
          room.participants.size
        );

        callback({ rtpCapabilities: room.router.rtpCapabilities });
      }
    );

    // CREATE TRANSPORT
    socket.on(
      "create-transport",
      async (data: { consuming: boolean }, callback) => {
        if (!participant || !currentRoom)
          return callback({ error: "Not in room" });

        const transport = await currentRoom.router.createWebRtcTransport({
          listenIps: [
            { ip: "0.0.0.0", announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP },
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        });

        participant.transports.set(transport.id, transport);

        transport.on(
          "dtlsstatechange",
          (dtls: "new" | "connecting" | "connected" | "closed") => {
            if (dtls === "closed") transport.close();
          }
        );

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      }
    );

    // CONNECT TRANSPORT
    socket.on(
      "connect-transport",
      async (data: { transportId: string; dtlsParameters: any }, callback) => {
        if (!participant) return callback({ error: "Not in room" });
        const transport = participant.transports.get(data.transportId);
        if (!transport) return callback({ error: "Transport not found" });
        await transport.connect({ dtlsParameters: data.dtlsParameters });
        callback({ success: true });
      }
    );

    // PRODUCE
    socket.on(
      "produce",
      async (
        data: {
          transportId: string;
          kind: "audio" | "video";
          rtpParameters: any;
        },
        callback
      ) => {
        if (!participant || !currentRoom)
          return callback({ error: "Not in room" });

        const transport = participant.transports.get(data.transportId);
        if (!transport) return callback({ error: "Transport not found" });

        const producer = await transport.produce({
          kind: data.kind,
          rtpParameters: data.rtpParameters,
        });

        participant.producers.set(producer.id, producer);

        // Notify others
        socket.to(currentRoom.code).emit("new-producer", {
          producerId: producer.id,
          participantId: socket.id,
          kind: data.kind,
        });

        callback({ id: producer.id });
      }
    );

    // CONSUME
    socket.on(
      "consume",
      async (
        data: { transportId: string; producerId: string; rtpCapabilities: any },
        callback
      ) => {
        if (!participant || !currentRoom)
          return callback({ error: "Not in room" });

        if (
          !currentRoom.router.canConsume({
            producerId: data.producerId,
            rtpCapabilities: data.rtpCapabilities,
          })
        ) {
          return callback({ error: "Cannot consume" });
        }

        const transport = participant.transports.get(data.transportId);
        if (!transport) return callback({ error: "Transport not found" });

        const consumer = await transport.consume({
          producerId: data.producerId,
          rtpCapabilities: data.rtpCapabilities,
          paused: true,
        });

        participant.consumers.set(consumer.id, consumer);

        consumer.on("transportclose", () =>
          participant?.consumers.delete(consumer.id)
        );
        consumer.on("producerclose", () => {
          participant?.consumers.delete(consumer.id);
          socket.emit("consumer-closed", { consumerId: consumer.id });
        });

        callback({
          id: consumer.id,
          producerId: data.producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      }
    );

    // DISCONNECT
    socket.on("disconnect", async () => {
      if (!participant || !currentRoom) return;

      participant.transports.forEach((t) => t.close());
      participant.producers.forEach((p) => p.close());
      participant.consumers.forEach((c) => c.close());
      currentRoom.participants.delete(socket.id);
      await redis.set(
        `room:${currentRoom.code}:participants`,
        currentRoom.participants.size
      );
    });
  });

  return io;
}
