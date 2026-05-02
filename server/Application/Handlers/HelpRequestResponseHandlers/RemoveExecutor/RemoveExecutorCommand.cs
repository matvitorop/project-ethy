using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.RemoveExecutor
{
    public sealed record RemoveExecutorCommand(
        Guid HelpRequestId,
        Guid CurrentUserId,
        string Reason
    ) : IRequest<Result>;
}
