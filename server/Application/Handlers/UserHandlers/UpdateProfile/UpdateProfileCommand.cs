using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UpdateProfile
{
    public sealed record UpdateProfileCommand(
        Guid UserId,
        string? PhoneNumber,
        string? SocialLinks
    ) : IRequest<Result>;

}
