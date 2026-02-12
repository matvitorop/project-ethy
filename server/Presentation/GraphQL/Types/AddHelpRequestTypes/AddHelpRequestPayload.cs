using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public record AddHelpRequestPayload(
        Guid? HelpRequestId,
        ErrorPayload? Error
    );
}
