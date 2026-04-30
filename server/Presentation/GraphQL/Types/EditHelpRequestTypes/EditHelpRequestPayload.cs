using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.EditHelpRequestTypes
{
    public sealed record EditHelpRequestPayload(
        bool Success,
        ErrorPayload? Error
    );
}
