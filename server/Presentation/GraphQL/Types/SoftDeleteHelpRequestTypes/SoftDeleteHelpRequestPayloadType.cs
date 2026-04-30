using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SoftDeleteHelpRequestTypes
{
    public sealed class SoftDeleteHelpRequestPayloadType
        : ObjectGraphType<SoftDeleteHelpRequestPayload>
    {
        public SoftDeleteHelpRequestPayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
