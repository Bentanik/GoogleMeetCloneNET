namespace RoomService.Apis.Requests.Auth;

public record RegisterUserByEmailRequest(string Email, string Password, string FullName);
