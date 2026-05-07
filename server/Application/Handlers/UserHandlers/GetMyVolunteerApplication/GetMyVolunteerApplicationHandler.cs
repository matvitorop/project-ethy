using MediatR;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetMyVolunteerApplication
{
    public class GetMyVolunteerApplicationHandler
    : IRequestHandler<GetMyVolunteerApplicationQuery, Result<VolunteerApplicationDto?>>
    {
        private readonly IVolunteerApplicationRepository _applications;
        public GetMyVolunteerApplicationHandler(IVolunteerApplicationRepository applications)
            => _applications = applications;

        public async Task<Result<VolunteerApplicationDto?>> Handle(
            GetMyVolunteerApplicationQuery request, CancellationToken ct)
        {
            var app = await _applications.GetLatestByUserIdAsync(request.UserId, ct);
            return Result<VolunteerApplicationDto?>.Success(app);
        }
    }
}
