using MediatR;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetActiveRequests
{
    public class GetHelpRequestsPageQuery
    : IRequest<Result<IReadOnlyList<HelpRequestListItemDto>>>
    {
        public int Page { get; }
        public int PageSize { get; }

        public HelpRequestStatus? Status { get; }
        public GetHelpRequestsPageQuery(int page, int pageSize, HelpRequestStatus? status = null)
        {
            Page = page < 1 ? 1 : page;
            PageSize = pageSize is < 1 or > 50 ? 10 : pageSize;
            Status = status;
        }
    }
}
