using server.Application.Handlers.GetFullHelpRequest;

namespace server.Presentation.GraphQL.Types
{
    public sealed record HelpRequestDetailPayload(
        HelpRequestDetailDto? Item,
        ErrorPayload? Error
    );
}
