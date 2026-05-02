using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ResignAsExecutorTypes
{
    public sealed record ResignAsExecutorPayload(
        bool Success,
        ErrorPayload? Error
    );
}
