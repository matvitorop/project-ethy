using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.HideHelpRequest
{
    public record HideHelpRequestCommand(Guid HelpRequestId, bool Hide) : IRequest<Result<bool>>;
}
