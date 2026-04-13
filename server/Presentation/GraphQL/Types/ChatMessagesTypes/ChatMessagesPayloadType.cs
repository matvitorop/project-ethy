using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;
using server.Presentation.GraphQL.Types.GetHRListTypes;

namespace server.Presentation.GraphQL.Types.ChatMessagesTypes
{
    public class ChatMessagesPayloadType : ObjectGraphType<ChatMessagesPayload>
    {
        public ChatMessagesPayloadType()
        {
            Field<ListGraphType<ChatMessageType>>("messages")
                .Resolve(ctx => ctx.Source.Messages);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
