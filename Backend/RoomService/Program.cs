var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.AddApplicationServices();

var app = builder.Build();

app.UseCors("AllowAll");

app.ConfigureMiddleware();

app.Run();