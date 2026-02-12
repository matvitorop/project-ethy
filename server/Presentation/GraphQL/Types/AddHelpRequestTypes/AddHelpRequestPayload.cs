using server.Application.Handlers.AddHelpRequest;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public record AddHelpRequestPayload(
        AddHelpRequestResult? Data,
        ErrorPayload? Error
    );
}
