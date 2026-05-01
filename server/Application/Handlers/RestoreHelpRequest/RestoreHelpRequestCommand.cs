using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.RestoreHelpRequest
{
    public sealed record RestoreHelpRequestCommand(
        Guid HelpRequestId,
        Guid CurrentUserId
    ) : IRequest<Result>;
}
