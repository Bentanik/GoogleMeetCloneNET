namespace GoogleMeetCloneNET.Bootstraping;

public static class ApplicationServiceExtensions
{
    private static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwagger();

        return services;
    }

    private static IServiceCollection AddConfigurationAppSetting(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DatabaseSettings>(configuration.GetSection(DatabaseSettings.SectionName));
        return services;
    }

    private static IServiceCollection AddConfigurationMediatR(this IServiceCollection services)
    {
        services.AddMediatR(config => config.RegisterServicesFromAssemblies(
            typeof(AssemblyReference).Assembly
        ))
        .AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);

        return services;
    }

    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services
               .AddSwaggerServices()
               .AddConfigurationMediatR()
               .AddConfigurationAppSetting(builder.Configuration);

        builder.Services.AddSingleton<AppDbContext>();

        return builder;
    }
}
