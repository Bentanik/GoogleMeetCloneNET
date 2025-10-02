namespace RoomService.DTOs;

public record JoinRoomResponse(bool Success, string? MediaServerUrl, int ParticipantCount);
