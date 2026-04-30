using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.CancelHelpRequestTypes
{
    public sealed record CancelHelpRequestPayload(
        bool Success,
        ErrorPayload? Error
    );
}
