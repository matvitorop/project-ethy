using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ResponseToHRTypes
{
    public sealed record ResponseToHelpRequestPayload(
        Guid? ResponseId,
        ErrorPayload? Error
    );
}
