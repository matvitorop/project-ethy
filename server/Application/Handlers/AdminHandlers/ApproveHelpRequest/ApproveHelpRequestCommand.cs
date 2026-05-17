using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.ApproveHelpRequest
{
    public record ApproveHelpRequestCommand(Guid HelpRequestId, Guid AdminId) : IRequest<Result>;
}
