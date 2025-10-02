using RoomService.Apis;

namespace RoomService.Bootstraping;

public static class MiddlewareExtensions
{
    public static void ConfigureMiddleware(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.ConfigureSwagger();
        }

        app.UseHttpsRedirection();

        app.MapAuthApi();
    }
}