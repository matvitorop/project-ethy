using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetChatMessages
{
    public sealed record GetChatMessagesQuery(Guid HelpRequestId,
        Guid RequestingUserId
    ) : IRequest<Result<IReadOnlyList<ChatMessageDto>>>;
}
