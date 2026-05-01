using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SoftDeleteUserTypes
{
    public sealed class SoftDeleteUserPayloadType
        : ObjectGraphType<SoftDeleteUserPayload>
    {
        public SoftDeleteUserPayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
