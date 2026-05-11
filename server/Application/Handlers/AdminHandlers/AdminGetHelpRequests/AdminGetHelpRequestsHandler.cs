using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.AdminGetHelpRequests
{
    public class AdminGetHelpRequestsHandler
        : IRequestHandler<AdminGetHelpRequestsQuery, Result<List<AdminHelpRequestDto>>>
    {
        private readonly IHelpRequestRepository _repo;
        public AdminGetHelpRequestsHandler(IHelpRequestRepository repo) => _repo = repo;

        public async Task<Result<List<AdminHelpRequestDto>>> Handle(
            AdminGetHelpRequestsQuery request, CancellationToken ct)
        {
            var items = await _repo.GetAllForAdminAsync(
                request.Page, 
                request.PageSize, 
                request.IsHidden, 
                request.IsDeleted,
                request.Statuses?.Select(s => (HelpRequestStatus)s).ToList(),
                request.SearchTerm,
                ct);
            return Result<List<AdminHelpRequestDto>>.Success(items);
        }
    }
}
