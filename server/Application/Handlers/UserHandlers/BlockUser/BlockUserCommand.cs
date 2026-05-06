using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.BlockUser
{
    public record BlockUserCommand(
        Guid AdminId,
        Guid TargetUserId,
        string Reason,
        DateTime? BlockedUntilUtc    // null = permanent
    ) : IRequest<Result<bool>>;
}
