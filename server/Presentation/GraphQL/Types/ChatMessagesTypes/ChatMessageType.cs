using GraphQL.Types;
using server.Application.Handlers.GetChatMessages;
namespace server.Presentation.GraphQL.Types.ChatMessagesTypes
{
    public class ChatMessageType : ObjectGraphType<ChatMessageDto>
    {
        public ChatMessageType() 
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.SenderId, type: typeof(IdGraphType));
            Field(x => x.Content);
            Field(x => x.CreatedAtUtc);
        }
    }
}
