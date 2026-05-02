using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReportTypes
{
    public sealed class ReportsPayloadType : ObjectGraphType<ReportsPayload>
    {
        public ReportsPayloadType()
        {
            Field<ListGraphType<ReportDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
