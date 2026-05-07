using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public record VolunteerApplicationsPayload(List<VolunteerApplicationDto>? Items, ErrorPayload? Error);
}
