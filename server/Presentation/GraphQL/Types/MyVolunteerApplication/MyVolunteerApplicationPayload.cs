using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.MyVolunteerApplication
{
    public record MyVolunteerApplicationPayload(
    VolunteerApplicationDto? Application,
    ErrorPayload? Error);

}
