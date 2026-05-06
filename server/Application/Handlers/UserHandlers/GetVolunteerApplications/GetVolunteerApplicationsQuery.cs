using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetVolunteerApplications
{
    public record GetVolunteerApplicationsQuery(int? Status) : IRequest<Result<List<VolunteerApplicationDto>>>;
}
