namespace server.Application.Handlers.UserHandlers.GetComplaints
{
    public record AdminComplaintDto(
        Guid Id,
        Guid ReporterUserId,
        string ReporterUsername,
        Guid TargetUserId,
        string TargetUsername,
        string Reason,
        bool IsResolved,
        DateTime CreatedAtUtc
    );
}
