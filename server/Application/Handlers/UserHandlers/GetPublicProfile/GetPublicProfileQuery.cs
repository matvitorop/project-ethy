using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetPublicProfile
{
    public record GetPublicProfileQuery(Guid TargetUserId) : IRequest<Result<PublicProfileDto>>;
}
