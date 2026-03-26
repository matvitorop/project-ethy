using server.Application.Handlers.AssignExecutor;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AssignExecutorTypes
{
    public sealed record AssignExecutorPayload(
        AssignExecutorResult? Data,
        ErrorPayload? Error
    );
}
