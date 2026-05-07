namespace server.Application.Handlers.UserHandlers.GetBlockHistory
{
    public record BlockHistoryDto(
        Guid Id,
        string AdminUsername,
        string Reason,
        DateTime? BlockedUntilUtc,
        DateTime CreatedAtUtc
    );
}
