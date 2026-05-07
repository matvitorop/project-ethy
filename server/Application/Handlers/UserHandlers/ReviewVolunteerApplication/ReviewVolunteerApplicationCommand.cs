using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ReviewVolunteerApplication
{
    public record ReviewVolunteerApplicationCommand(
        Guid AdminId,
        Guid ApplicationId,
        bool Approve,
        string? Comment
    ) : IRequest<Result<bool>>;
}
