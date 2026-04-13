using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.SendMessage
{
    public sealed record SendMessageCommand(
        Guid HelpRequestId,
        Guid SenderId,
        string Content
    ) : IRequest<Result<Guid>>;
}
