using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestsPagePayloadType
    : ObjectGraphType<HelpRequestsPagePayload>
    {
        public HelpRequestsPagePayloadType()
        {
            Field(x => x.IsSuccess);
            Field<ListGraphType<HelpRequestListItemType>>(
                "items",
                resolve: ctx => ctx.Source.Items
            );
            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
