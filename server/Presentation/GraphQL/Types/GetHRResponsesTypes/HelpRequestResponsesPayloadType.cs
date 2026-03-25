using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRResponsesTypes
{
    public sealed class HelpRequestResponsesPayloadType
        : ObjectGraphType<HelpRequestResponsesPayload>
    {
        public HelpRequestResponsesPayloadType()
        {
            Field<ListGraphType<HelpRequestResponseItemType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
