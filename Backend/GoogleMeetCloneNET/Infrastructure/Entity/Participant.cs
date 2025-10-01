namespace GoogleMeetCloneNET.Infrastructure.Entity;

public class Participant
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("role")]
    public string Role { get; set; } = "guest";

    [BsonElement("joinedAt")]
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("leftAt")]
    public DateTime? LeftAt { get; set; }

    [BsonElement("isMuted")]
    public bool IsMuted { get; set; } = false;

    [BsonElement("isCameraOn")]
    public bool IsCameraOn { get; set; } = true;
}
