using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetBlockHistory;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class BlockHistoryPayloadType : ObjectGraphType<BlockHistoryPayload>
    {
        public BlockHistoryPayloadType()
        {
            Field<ListGraphType<BlockHistoryDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
