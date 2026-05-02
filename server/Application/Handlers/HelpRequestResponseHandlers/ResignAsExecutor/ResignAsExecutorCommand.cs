using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.ResignAsExecutor
{
    public sealed record ResignAsExecutorCommand(
        Guid HelpRequestId,
        Guid CurrentUserId,
        string Reason
    ) : IRequest<Result>;
}
