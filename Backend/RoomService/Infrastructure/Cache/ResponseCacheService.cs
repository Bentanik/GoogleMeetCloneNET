namespace RoomService.Infrastructure.Cache;

public class ResponseCacheService : IResponseCacheService
{
    private readonly IConnectionMultiplexer _redis;

    public ResponseCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task SetAsync(string key, string value, TimeSpan? expiry = null)
    {
        var db = _redis.GetDatabase();
        await db.StringSetAsync(key, value, expiry);
    }

    public async Task<string?> GetAsync(string key)
    {
        var db = _redis.GetDatabase();
        var result = await db.StringGetAsync(key);
        return result.HasValue ? result.ToString() : null;
    }

    public async Task RemoveAsync(string key)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
    }
}