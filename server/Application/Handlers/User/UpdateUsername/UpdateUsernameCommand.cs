using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.User.UpdateUsername
{
    public sealed record UpdateUsernameCommand(
        Guid UserId,
        string NewUsername
    ) : IRequest<Result>;
}
