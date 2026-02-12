using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRListTypes
{
    public class HelpRequestsPagePayloadType
    : ObjectGraphType<HelpRequestsPagePayload>
    {
        public HelpRequestsPagePayloadType()
        {
            Field<ListGraphType<HelpRequestListItemType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
