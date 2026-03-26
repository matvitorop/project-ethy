using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AssignExecutor
{
    public sealed record AssgnExecutorCommand(
        Guid HelpRequestId,
        Guid ResponseId,
        Guid CurrentUserId
    ) : IRequest<Result<AssignExecutorResult>>;
}
