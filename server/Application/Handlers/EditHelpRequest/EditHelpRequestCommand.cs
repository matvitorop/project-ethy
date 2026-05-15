using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.EditHelpRequest
{
    public sealed record EditHelpRequestCommand(
        Guid HelpRequestId,
        Guid CurrentUserId,
        string Title,
        string Description,
        double? Latitude,
        double? Longitude,
        IReadOnlyList<string> ImageUrls
    ) : IRequest<Result>;
}
