namespace RoomService.Helpers;

public class RedisRoomHelper
{
    private readonly IResponseCacheService _responseCache;

    public RedisRoomHelper(IResponseCacheService responseCache)
    {
        _responseCache = responseCache;
    }

    public async Task SaveRoomAsync(RoomInfo room, TimeSpan ttl)
    {
        var roomJson = JsonSerializer.Serialize(room);
        await _responseCache.SetAsync($"room:{room.RoomCode}", roomJson, ttl);
    }

    public async Task SaveRoomPasswordAsync(string roomCode, string hashedPassword, TimeSpan ttl)
    {
        await _responseCache.SetAsync($"room:{roomCode}:password", hashedPassword, ttl);
    }

    public async Task<string?> GetRoomJsonAsync(string roomCode)
    {
        return await _responseCache.GetAsync($"room:{roomCode}");
    }

    public async Task<string?> GetRoomPasswordAsync(string roomCode)
    {
        return await _responseCache.GetAsync($"room:{roomCode}:password");
    }

    public async Task<int> GetParticipantCountAsync(string roomCode)
    {
        var participantCountStr = await _responseCache.GetAsync($"room:{roomCode}:participants");
        return !string.IsNullOrEmpty(participantCountStr) ? int.Parse(participantCountStr) : 0;
    }

    public async Task DeleteRoomAsync(string roomCode)
    {
        await Task.WhenAll(
            _responseCache.RemoveAsync($"room:{roomCode}"),
            _responseCache.RemoveAsync($"room:{roomCode}:password"),
            _responseCache.RemoveAsync($"room:{roomCode}:participants")
        );
    }
}
