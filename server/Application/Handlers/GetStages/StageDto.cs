namespace server.Application.Handlers.GetStages
{
    public sealed record StageDto(
        Guid Id,
        Guid ProposedByUserId,
        string Content,
        int Status,
        string? RejectionReason,
        DateTime CreatedAtUtc,
        DateTime? ResolvedAtUtc
    );
}
