using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AssignExecutor
{
    public sealed record AssignExecutorCommand(
        Guid HelpRequestId,
        Guid ResponseId,
        Guid CurrentUserId
    ) : IRequest<Result<AssignExecutorResult>>;
}
