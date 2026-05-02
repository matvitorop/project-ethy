using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.CancelResponseTypes
{
    public sealed record CancelResponsePayload(
        bool Success,
        ErrorPayload? Error
    );
}
