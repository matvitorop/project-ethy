using server.Application.Handlers.GetHelpRequestResponses;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRResponsesTypes
{
    public sealed record HelpRequestResponsesPayload(
       IReadOnlyList<HelpRequestResponseDto>? Items,
       ErrorPayload? Error
   );
}
