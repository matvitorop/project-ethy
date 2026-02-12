using server.Application.Handlers.GetActiveRequests;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRListTypes
{
    public sealed record HelpRequestsPagePayload(

        IReadOnlyList<HelpRequestListItemDto>? Items,
        ErrorPayload? Error
    );
}
