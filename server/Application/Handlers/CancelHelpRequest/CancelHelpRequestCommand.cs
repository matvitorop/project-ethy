using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.CancelHelpRequest
{
    public sealed record CancelHelpRequestCommand(
        Guid HelpRequestId,
        Guid CurrentUserId,
        string Reason
    ) : IRequest<Result>;
}
