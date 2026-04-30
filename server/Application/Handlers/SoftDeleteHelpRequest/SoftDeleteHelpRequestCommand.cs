using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.SoftDeleteHelpRequest
{
    public sealed record SoftDeleteHelpRequestCommand(
        Guid HelpRequestId,
        Guid CurrentUserId
    ) : IRequest<Result>;
}
