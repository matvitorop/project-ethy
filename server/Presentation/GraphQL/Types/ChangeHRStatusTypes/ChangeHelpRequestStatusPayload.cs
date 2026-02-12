using server.Application.Handlers.ChangeHelpRequestStatus;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ChangeHRStatusTypes
{
    public sealed record ChangeHelpRequestStatusPayload(
        ChangeHelpRequestStatusResult? Data,
        ErrorPayload? Error
    );
}
