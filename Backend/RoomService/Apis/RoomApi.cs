namespace RoomService.Apis;

public static class RoomApi
{
    public static IEndpointRouteBuilder MapRoomApi(this IEndpointRouteBuilder builder)
    {
        builder.MapGroup("/api/v1/rooms")
               .MapRoomEndpoints()
               .WithTags("Room Api");

        return builder;
    }

    private static RouteGroupBuilder MapRoomEndpoints(this RouteGroupBuilder group)
    {
        // Create Room
        group.MapPost("", async (
            [FromBody] CreateRoomRequest request,
            [FromServices] IResponseCacheService responseCache,
            [FromServices] IPasswordHashService passwordHash) =>
        {
            var roomCode = GenerateRoomCode();
            var roomId = Guid.NewGuid().ToString();
            var createdAt = DateTime.UtcNow;

            var room = new RoomInfo(
                RoomCode: roomCode,
                RoomId: roomId,
                ParticipantCount: 0,
                CreatedAt: createdAt,
                IsActive: true
            );

            // Store in Redis with 24h TTL
            var roomJson = JsonSerializer.Serialize(room);
            await responseCache.SetAsync($"room:{roomCode}", roomJson, TimeSpan.FromHours(24));

            // Store password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                var hashedPassword = passwordHash.HashPassword(request.Password);
                await responseCache.SetAsync($"room:{roomCode}:password", hashedPassword, TimeSpan.FromHours(24));
            }

            var mediaServerUrl = Environment.GetEnvironmentVariable("MEDIA_SERVER_URL") ?? "http://localhost:5002";

            return Results.Ok(new CreateRoomResponse(roomCode, roomId, mediaServerUrl));
        })
        .WithName("CreateRoom")
        .Produces<CreateRoomResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status500InternalServerError);

        // Join Room
        group.MapPost("join", async (
            [FromBody] JoinRoomRequest request,
            [FromServices] IResponseCacheService responseCache,
            [FromServices] IPasswordHashService passwordHash) =>
        {
            // Check if room exists
            var roomJson = await responseCache.GetAsync($"room:{request.RoomCode}");
            if (string.IsNullOrEmpty(roomJson))
            {
                return Results.BadRequest(new { error = "Room not found" });
            }

            // Check password if required
            var storedPasswordHash = await responseCache.GetAsync($"room:{request.RoomCode}:password");
            if (!string.IsNullOrEmpty(storedPasswordHash))
            {
                // Room has password, verify it
                if (string.IsNullOrEmpty(request.Password))
                {
                    return Results.Unauthorized();
                }

                var isPasswordValid = passwordHash.VerifyPassword(request.Password, storedPasswordHash);
                if (!isPasswordValid)
                {
                    return Results.Unauthorized();
                }
            }

            // Get participant count
            var participantCountStr = await responseCache.GetAsync($"room:{request.RoomCode}:participants");
            var count = !string.IsNullOrEmpty(participantCountStr) ? int.Parse(participantCountStr) : 0;

            var mediaServerUrl = Environment.GetEnvironmentVariable("MEDIA_SERVER_URL") ?? "http://localhost:5002";

            return Results.Ok(new JoinRoomResponse(
                Success: true,
                MediaServerUrl: mediaServerUrl,
                ParticipantCount: count
            ));
        })
        .WithName("JoinRoom")
        .Produces<JoinRoomResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        // Get Room Info
        group.MapGet("{code}", async (
            string code,
            [FromServices] IResponseCacheService responseCache) =>
        {
            var roomJson = await responseCache.GetAsync($"room:{code}");

            if (string.IsNullOrEmpty(roomJson))
            {
                return Results.NotFound(new { error = "Room not found or expired" });
            }

            var room = JsonSerializer.Deserialize<RoomInfo>(roomJson);
            if (room == null)
            {
                return Results.NotFound(new { error = "Invalid room data" });
            }

            // Get current participant count
            var participantCountStr = await responseCache.GetAsync($"room:{code}:participants");
            var count = !string.IsNullOrEmpty(participantCountStr) ? int.Parse(participantCountStr) : 0;

            var updatedRoom = room with { ParticipantCount = count };

            return Results.Ok(updatedRoom);
        })
        .WithName("GetRoom")
        .Produces<RoomInfo>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // Delete Room
        group.MapDelete("{code}", async (
            string code,
            [FromServices] IResponseCacheService responseCache) =>
        {
            await responseCache.RemoveAsync($"room:{code}");
            await responseCache.RemoveAsync($"room:{code}:password");
            await responseCache.RemoveAsync($"room:{code}:participants");

            return Results.Ok(new { message = "Room deleted" });
        })
        .WithName("DeleteRoom")
        .Produces(StatusCodes.Status200OK);

        return group;
    }

    private static string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var seed = DateTime.UtcNow.Ticks.GetHashCode();
        var random = new Random(seed);

        return new string(
            Enumerable.Range(0, 6)
                .Select(_ => chars[random.Next(chars.Length)])
                .ToArray()
        );
    }
}