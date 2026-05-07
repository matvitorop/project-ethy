using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public record ComplaintsPayload(List<AdminComplaintDto>? Items, ErrorPayload? Error);
}
