using MediatR;

namespace server.Application.Handlers.AddHelpRequest
{
    public record AddHelpRequestCommand(
        Guid CreatorId,
        string Title,
        string Description,
        double? Latitude,
        double? Longitude,
        IReadOnlyList<string> ImageUrls) : IRequest<AddHelpRequestResult>;
}
