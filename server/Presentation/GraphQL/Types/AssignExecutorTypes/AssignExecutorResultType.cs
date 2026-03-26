using GraphQL.Types;
using server.Application.Handlers.AssignExecutor;

namespace server.Presentation.GraphQL.Types.AssignExecutorTypes
{
    public sealed class AssignExecutorResultType
        : ObjectGraphType<AssignExecutorResult>
    {
        public AssignExecutorResultType()
        {
            Field(x => x.HelpRequestId, type: typeof(IdGraphType));
            Field(x => x.AssignedUserId, type: typeof(GuidGraphType));
        }
    }
}
