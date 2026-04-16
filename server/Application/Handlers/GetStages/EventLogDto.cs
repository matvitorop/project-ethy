namespace server.Application.Handlers.GetStages
{
    public sealed record EventLogDto(
        Guid Id,
        Guid ActorId,
        int EventType,
        string Payload,
        DateTime CreatedAtUtc
    );
}
