using GraphQL.Types;
using server.Application.Handlers.GetMyChats;

namespace server.Presentation.GraphQL.Types.ChatTypes
{
    public sealed class ChatListItemDtoType : ObjectGraphType<ChatListItemDto>
    {
        public ChatListItemDtoType()
        {
            Field(x => x.ChatId, type: typeof(IdGraphType));
            Field(x => x.HelpRequestId, type: typeof(GuidGraphType));
            Field(x => x.HelpRequestTitle);
            Field(x => x.OwnerId, type: typeof(GuidGraphType));
            Field(x => x.AssigneeId, type: typeof(GuidGraphType));
            Field(x => x.CreatedAtUtc);
        }
    }
}
