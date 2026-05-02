namespace server.Application.Handlers.HelpRequestResponseHandlers.GetReports
{
    public sealed record ReportDto(
        Guid Id,
        Guid CreatedByUserId,
        Guid? LastAssignedUserId,
        string Comment,
        string? ImageUrl,
        DateTime CreatedAtUtc
    );
}
