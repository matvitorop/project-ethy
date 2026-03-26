using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AssignExecutorTypes
{
    public sealed class AssignExecutorPayloadType
        : ObjectGraphType<AssignExecutorPayload>
    {
        public AssignExecutorPayloadType()
        {
            Field<AssignExecutorResultType>("data")
                .Resolve(ctx => ctx.Source.Data);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
