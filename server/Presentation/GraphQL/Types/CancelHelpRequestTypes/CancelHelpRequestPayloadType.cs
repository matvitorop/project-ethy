using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.CancelHelpRequestTypes
{
    public sealed class CancelHelpRequestPayloadType
        : ObjectGraphType<CancelHelpRequestPayload>
    {
        public CancelHelpRequestPayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
