using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SoftDeleteHelpRequestTypes
{
    public sealed record SoftDeleteHelpRequestPayload(
        bool Success,
        ErrorPayload? Error
    );
}
