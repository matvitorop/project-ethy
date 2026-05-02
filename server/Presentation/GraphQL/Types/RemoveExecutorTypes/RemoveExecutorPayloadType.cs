using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RemoveExecutorTypes
{
    public sealed class RemoveExecutorPayloadType
        : ObjectGraphType<RemoveExecutorPayload>
    {
        public RemoveExecutorPayloadType()
        {
            Field(x => x.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
