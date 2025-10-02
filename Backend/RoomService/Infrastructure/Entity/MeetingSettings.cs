namespace RoomService.Infrastructure.Entity;

public class MeetingSettings
{
    [BsonElement("allowScreenShare")]
    public bool AllowScreenShare { get; set; } = true;

    [BsonElement("allowChat")]
    public bool AllowChat { get; set; } = true;

    [BsonElement("recordingEnabled")]
    public bool RecordingEnabled { get; set; } = false;
}