using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UnblockUser
{
    public record UnblockUserCommand(Guid TargetUserId) : IRequest<Result<bool>>;
}
