using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.SoftDeleteUser
{
    public sealed record SoftDeleteUserCommand(
        Guid TargetUserId,
        Guid CurrentUserId
    ) : IRequest<Result>;
}
