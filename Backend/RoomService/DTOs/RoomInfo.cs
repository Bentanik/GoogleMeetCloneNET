namespace RoomService.DTOs;

public record RoomInfo(string RoomCode, string RoomId, int ParticipantCount, DateTime CreatedAt, bool IsActive);
