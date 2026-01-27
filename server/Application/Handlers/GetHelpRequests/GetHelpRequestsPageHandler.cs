using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Application.IRepositories;

namespace server.Application.Handlers.GetHelpRequests
{
    public class GetHelpRequestsPageHandler
    : IRequestHandler<GetHelpRequestsPageQuery, IReadOnlyList<HelpRequestListItemDto>>
    {
        private readonly IHelpRequestRepository _repo;

        public GetHelpRequestsPageHandler(IHelpRequestRepository repo)
        {
            _repo = repo;
        }

        public async Task<IReadOnlyList<HelpRequestListItemDto>> Handle(
            GetHelpRequestsPageQuery request,
            CancellationToken ct)
        {
            return await _repo.GetPageAsync(
                request.Page,
                request.PageSize,
                ct);
        }
    }
}
