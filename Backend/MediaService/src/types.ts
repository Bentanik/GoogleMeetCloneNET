export interface RoomInfo {
  roomCode: string;
  roomId: string;
  participantCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface CreateTransportRequest {
  roomCode: string;
  direction: "send" | "recv";
  rtpCapabilities?: any;
}

export interface ConnectTransportRequest {
  roomCode: string;
  transportId: string;
  dtlsParameters: any;
}

export interface ProduceRequest {
  roomCode: string;
  transportId: string;
  kind: "audio" | "video";
  rtpParameters: any;
}

export interface ConsumeRequest {
  roomCode: string;
  transportId: string;
  producerId: string;
  rtpCapabilities: any;
}
