namespace RoomService.Infrastructure.PasswordHash;

public interface IPasswordHashService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHashed);
}
