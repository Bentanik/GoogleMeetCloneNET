namespace GoogleMeetCloneNET.Infrastructure.Data;

public class AppDbContext
{
    private readonly IMongoDatabase _database;

    public AppDbContext(IOptions<DatabaseSettings> databaseSettings)
    {
        var client = new MongoClient(databaseSettings.Value.ConnectionString);
        _database = client.GetDatabase(databaseSettings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Meeting> Meetings => _database.GetCollection<Meeting>("meetings");
    public IMongoCollection<Message> Messages => _database.GetCollection<Message>("messages");
}