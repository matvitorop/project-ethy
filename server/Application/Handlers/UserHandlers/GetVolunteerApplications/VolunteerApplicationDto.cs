namespace server.Application.Handlers.UserHandlers.GetVolunteerApplications
{
    public record VolunteerApplicationDto(
        Guid Id,
        Guid UserId,
        string Username,
        string OrganizationName,
        string ActivityDescription,
        string? DocumentImageUrl,
        int Status,
        string? AdminComment,
        DateTime SubmittedAtUtc,
        DateTime? ReviewedAtUtc
    );
}
