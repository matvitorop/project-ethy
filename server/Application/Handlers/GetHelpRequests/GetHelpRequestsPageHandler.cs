using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetHelpRequests
{
    public class GetHelpRequestsPageHandler
    : IRequestHandler<GetHelpRequestsPageQuery, Result<IReadOnlyList<HelpRequestListItemDto>>>
    {
        private readonly IHelpRequestRepository _repo;

        public GetHelpRequestsPageHandler(IHelpRequestRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<IReadOnlyList<HelpRequestListItemDto>>> Handle(GetHelpRequestsPageQuery request, CancellationToken ct)
        {
            if (request.Page < 1)
            {
                return Result<IReadOnlyList<HelpRequestListItemDto>>.Failure(
                    new Error(
                        "Page number must be greater than zero.",
                        "Pagination.InvalidPage"
                    )
                );
            }

            var items = await _repo.GetPageAsync(
                ct,
                request.Page,
                request.PageSize);

            return Result<IReadOnlyList<HelpRequestListItemDto>>.Success(items);
        }
    }
}
