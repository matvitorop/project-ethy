using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.User.GetProfile
{
    public sealed record GetProfileQuery(
        Guid UserId
    ) : IRequest<Result<ProfileDto>>;
}
