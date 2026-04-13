using server.Application.Handlers.GetChatMessages;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ChatMessagesTypes
{
    public sealed record ChatMessagesPayload(IReadOnlyList<ChatMessageDto>? Messages, ErrorPayload? Error);
}
