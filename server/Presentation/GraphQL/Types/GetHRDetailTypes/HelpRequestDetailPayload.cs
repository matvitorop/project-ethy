using server.Application.Handlers.GetFullHelpRequest;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRDetailTypes
{
    public sealed record HelpRequestDetailPayload(
        HelpRequestDetailDto? Item,
        ErrorPayload? Error
    );
}
