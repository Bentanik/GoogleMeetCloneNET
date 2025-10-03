import request from "@/services/interceptor";

export interface CreateRoomRequest {
  password?: string;
}

export interface CreateRoomResponse {
  roomCode: string;
  roomId: string;
  mediaServerUrl: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  password?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  mediaServerUrl: string;
  participantCount: number;
}

export const RoomService = {
  createRoom: (data: CreateRoomRequest) =>
    request.post<CreateRoomResponse>("/api/v1/rooms", data),

  joinRoom: (data: JoinRoomRequest) =>
    request.post<JoinRoomResponse>("/api/v1/rooms/join", data),

  getRoom: (roomCode: string) =>
    request.get<CreateRoomResponse>(`/api/v1/rooms/${roomCode}`),

  deleteRoom: (roomCode: string) =>
    request.delete<{ message: string }>(`/api/v1/rooms/${roomCode}`),
};
