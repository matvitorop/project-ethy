using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RestoreHelpRequestTypes
{
    public sealed record RestoreHelpRequestPayload(
        bool Success,
        ErrorPayload? Error
    );
}
