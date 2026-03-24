using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.ResponseToHelpRequestHandler
{
    public sealed record ResponseToHelpRequestCommand(
        Guid HelpRequestId, 
        Guid UserId,
        string Message) : IRequest<Result<Guid>>;
}
