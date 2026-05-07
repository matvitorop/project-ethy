using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetVolunteerApplications
{
    public class GetVolunteerApplicationsHandler
        : IRequestHandler<GetVolunteerApplicationsQuery, Result<List<VolunteerApplicationDto>>>
    {
        private readonly IVolunteerApplicationRepository _applications;

        public GetVolunteerApplicationsHandler(IVolunteerApplicationRepository applications)
        {
            _applications = applications;
        }

        public async Task<Result<List<VolunteerApplicationDto>>> Handle(
            GetVolunteerApplicationsQuery request,
            CancellationToken ct)
        {
            var items = await _applications.GetAllAsync(request.Status, ct);
            return Result<List<VolunteerApplicationDto>>.Success(items);
        }
    }
}
