using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.RejectHelpRequest
{
    public record RejectHelpRequestCommand(Guid HelpRequestId, Guid AdminId, string Reason) : IRequest<Result>;
}
