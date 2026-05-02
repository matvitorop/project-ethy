using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ResignAsExecutorTypes
{
    public sealed class ResignAsExecutorPayloadType
        : ObjectGraphType<ResignAsExecutorPayload>
    {
        public ResignAsExecutorPayloadType()
        {
            Field(x => x.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
