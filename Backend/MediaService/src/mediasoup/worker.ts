import * as mediasoup from "mediasoup";
import {
  CreateTransportRequest,
  ConnectTransportRequest,
  ProduceRequest,
  ConsumeRequest,
} from "@/types";

interface PeerTransports {
  send: mediasoup.types.WebRtcTransport | null;
  recv: mediasoup.types.WebRtcTransport | null;
}

const workerPromise = mediasoup.createWorker({
  logLevel: "warn",
  rtcMinPort: 10000,
  rtcMaxPort: 10100,
});

const roomRouters: Map<string, mediasoup.types.Router> = new Map();
const peerTransports: Map<string, Map<string, PeerTransports>> = new Map();
const producers: Map<string, Map<string, mediasoup.types.Producer>> = new Map();

export async function initMediasoup(): Promise<void> {
  const worker = await workerPromise;
  worker.on("died", () => {
    console.error("Mediasoup worker died");
    process.exit(1);
  });
}

export async function getRouter(
  roomCode: string
): Promise<mediasoup.types.Router> {
  if (!roomRouters.has(roomCode)) {
    const worker = await workerPromise;
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
          parameters: { "x-google-start-bitrate": 1000 },
        },
      ],
    });
    roomRouters.set(roomCode, router);
  }
  return roomRouters.get(roomCode)!;
}

export async function createTransport(
  roomCode: string,
  peerId: string,
  request: CreateTransportRequest
): Promise<mediasoup.types.WebRtcTransport> {
  const router = await getRouter(roomCode);
  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: process.env.ANNOUNCED_IP || "" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  if (!peerTransports.has(roomCode)) peerTransports.set(roomCode, new Map());
  if (!peerTransports.get(roomCode)!.has(peerId)) {
    peerTransports.get(roomCode)!.set(peerId, { send: null, recv: null });
  }
  peerTransports.get(roomCode)!.get(peerId)![request.direction] = transport;

  return transport;
}

export async function connectTransport(
  roomCode: string,
  peerId: string,
  request: ConnectTransportRequest
): Promise<void> {
  const transport = peerTransports.get(roomCode)?.get(peerId)?.[
    request.transportId === peerTransports.get(roomCode)?.get(peerId)?.send?.id
      ? "send"
      : "recv"
  ];
  if (!transport) throw new Error("Transport not found");
  await transport.connect({ dtlsParameters: request.dtlsParameters });
}

export async function produce(
  roomCode: string,
  peerId: string,
  request: ProduceRequest
): Promise<string> {
  const transport = peerTransports.get(roomCode)?.get(peerId)?.send;
  if (!transport) throw new Error("Send transport not found");
  const producer = await transport.produce({
    kind: request.kind as any,
    rtpParameters: request.rtpParameters,
  });

  if (!producers.has(roomCode)) producers.set(roomCode, new Map());
  producers.get(roomCode)!.set(producer.id, producer);

  return producer.id;
}

export async function consume(
  roomCode: string,
  peerId: string,
  request: ConsumeRequest
): Promise<mediasoup.types.Consumer> {
  const router = await getRouter(roomCode);
  if (
    !router.canConsume({
      producerId: request.producerId,
      rtpCapabilities: request.rtpCapabilities,
    })
  ) {
    throw new Error("Cannot consume");
  }
  const transport = peerTransports.get(roomCode)?.get(peerId)?.recv;
  if (!transport) throw new Error("Recv transport not found");
  return await transport.consume({
    producerId: request.producerId,
    rtpCapabilities: request.rtpCapabilities,
    paused: true,
  });
}

export function getProducerIds(roomCode: string): string[] {
  return Array.from(producers.get(roomCode)?.keys() || []);
}

export function cleanupPeer(roomCode: string, peerId: string): void {
  const transports = peerTransports.get(roomCode)?.get(peerId);
  if (transports) {
    transports.send?.close();
    transports.recv?.close();
    peerTransports.get(roomCode)?.delete(peerId);
  }

  producers.get(roomCode)?.forEach((producer, id) => {
    if (producer.appData.peerId === peerId) {
      producer.close();
      producers.get(roomCode)?.delete(id);
    }
  });
}

export function cleanupRoom(roomCode: string): void {
  const router = roomRouters.get(roomCode);
  if (router) router.close();
  roomRouters.delete(roomCode);
  peerTransports
    .get(roomCode)
    ?.forEach((_, peerId) => cleanupPeer(roomCode, peerId));
  peerTransports.delete(roomCode);
  producers.delete(roomCode);
}
