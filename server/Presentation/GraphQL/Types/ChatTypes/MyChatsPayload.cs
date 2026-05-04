using server.Application.Handlers.GetMyChats;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ChatTypes
{
    public sealed record MyChatsPayload(
       IReadOnlyList<ChatListItemDto>? Items,
       ErrorPayload? Error
   );
}
