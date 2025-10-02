namespace RoomService.Infrastructure.Entity;

public class Meeting
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("title")]
    public string Title { get; set; } = null!;

    [BsonElement("hostId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string HostId { get; set; } = null!;

    [BsonElement("participants")]
    public List<Participant> Participants { get; set; } = new();

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("startTime")]
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    [BsonElement("endTime")]
    public DateTime? EndTime { get; set; }

    [BsonElement("settings")]
    public MeetingSettings Settings { get; set; } = new();
}
