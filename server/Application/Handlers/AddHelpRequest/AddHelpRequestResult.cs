using server.Domain.HelpRequest;

namespace server.Application.Handlers.AddHelpRequest
{
    public sealed record AddHelpRequestResult(
        Guid Id,
        string Title,
        string Description,
        Guid CreatorId,
        DateTime CreatedAtUtc,
        HelpRequestStatus Status,
        double? Latitude,
        double? Longitude,
        IReadOnlyList<string> ImageUrls
    );
}
