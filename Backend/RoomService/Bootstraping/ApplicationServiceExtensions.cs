using RoomService.Infrastructure.PasswordHash;

namespace RoomService.Bootstraping;

public static class ApplicationServiceExtensions
{
    private static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwagger();
        return services;
    }
    private static IServiceCollection AddRedisServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RedisSettings>(
            configuration.GetSection(RedisSettings.SectionName));

        var redisSettings = configuration
            .GetSection(RedisSettings.SectionName)
            .Get<RedisSettings>() ?? new RedisSettings();

        if (!redisSettings.Enabled)
            return services;

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(redisSettings.ConnectionString));

        services.AddSingleton<IResponseCacheService, ResponseCacheService>();

        return services;
    }

    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services
            .AddSwaggerServices()
            .AddRedisServices(builder.Configuration);

        builder.Services.AddSingleton<IPasswordHashService, PasswordHashService>();
        return builder;
    }
}