using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.CancelResponseTypes
{
    public sealed class CancelResponsePayloadType
        : ObjectGraphType<CancelResponsePayload>
    {
        public CancelResponsePayloadType()
        {
            Field(x => x.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
