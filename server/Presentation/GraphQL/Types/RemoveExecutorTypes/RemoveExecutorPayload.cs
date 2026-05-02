using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RemoveExecutorTypes
{
    public sealed record RemoveExecutorPayload(
        bool Success,
        ErrorPayload? Error
    );
}
