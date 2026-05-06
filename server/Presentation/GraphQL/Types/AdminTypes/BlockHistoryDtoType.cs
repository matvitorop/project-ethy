using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetBlockHistory;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class BlockHistoryDtoType : ObjectGraphType<BlockHistoryDto>
    {
        public BlockHistoryDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.AdminUsername);
            Field(x => x.Reason);
            Field(x => x.BlockedUntilUtc, nullable: true);
            Field(x => x.CreatedAtUtc);
        }
    }
}
