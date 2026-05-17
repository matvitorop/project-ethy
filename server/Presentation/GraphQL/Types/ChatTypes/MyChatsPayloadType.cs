using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ChatTypes
{
    public sealed class MyChatsPayloadType : ObjectGraphType<MyChatsPayload>
    {
        public MyChatsPayloadType()
        {
            Field<ListGraphType<ChatListItemDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
