using MediatR;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetMyVolunteerApplication
{
    public record GetMyVolunteerApplicationQuery(Guid UserId)
    : IRequest<Result<VolunteerApplicationDto?>>;
}
