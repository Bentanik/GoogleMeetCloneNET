using GoogleMeetCloneNET.Apis.Requests.Auth;

namespace GoogleMeetCloneNET.Apis;

public static class AuthApi
{
    public static IEndpointRouteBuilder MapAuthApi(this IEndpointRouteBuilder builder)
    {
        builder.MapGroup("/api/v1/auth")
               .MapAuthEndpoints()
               .WithTags("Auth Api");

        return builder;
    }

    private static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("register", async (ISender sender, [FromBody] RegisterUserByEmailRequest request) =>
        {
            var results = await sender.Send(new RegisterUserByEmailCommand(request.Email, request.Password, request.FullName));

            return Results.Ok(new { Message = "Register OK" });
        });

        group.MapPost("login", () =>
        {
            return Results.Ok(new { Message = "Login OK" });
        });

        return group;
    }
}
