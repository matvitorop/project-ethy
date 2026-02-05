using MediatR;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.ChangeHelpRequestStatus
{
    public sealed record ChangeHelpRequestStatusCommand(
        Guid HelpRequestId,
        HelpRequestStatus NewStatus,
        Guid CurrentUserId
    ) : IRequest<Result>;
}
