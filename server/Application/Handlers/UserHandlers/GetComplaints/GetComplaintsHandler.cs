using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetComplaints
{
    public class GetComplaintsHandler
        : IRequestHandler<GetComplaintsQuery, Result<List<AdminComplaintDto>>>
    {
        private readonly IComplaintRepository _complaints;
        public GetComplaintsHandler(IComplaintRepository complaints) => _complaints = complaints;

        public async Task<Result<List<AdminComplaintDto>>> Handle(
            GetComplaintsQuery request, CancellationToken ct)
        {
            var items = await _complaints.GetAllForAdminAsync(request.IsResolved, ct);
            return Result<List<AdminComplaintDto>>.Success(items);
        }
    }
}
