using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.CancelResponse
{
    public sealed record CancelResponseCommand(
        Guid HelpRequestId,
        Guid CurrentUserId
    ) : IRequest<Result>;
}
