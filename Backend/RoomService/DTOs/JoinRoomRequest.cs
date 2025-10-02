namespace RoomService.DTOs;

public record JoinRoomRequest(string RoomCode, string DisplayName, string? Password = null);