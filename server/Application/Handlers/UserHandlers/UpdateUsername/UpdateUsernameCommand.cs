using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UpdateUsername
{
    public sealed record UpdateUsernameCommand(
        Guid UserId,
        string NewUsername
    ) : IRequest<Result>;
}
