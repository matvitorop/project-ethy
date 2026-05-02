using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReportTypes
{
    public sealed class CreateReportPayloadType
        : ObjectGraphType<CreateReportPayload>
    {
        public CreateReportPayloadType()
        {
            Field<IdGraphType>("reportId")
                .Resolve(ctx => ctx.Source.ReportId);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
