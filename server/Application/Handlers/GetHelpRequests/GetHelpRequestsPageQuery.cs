using MediatR;

namespace server.Application.Handlers.GetActiveRequests
{
    public class GetHelpRequestsPageQuery
    : IRequest<IReadOnlyList<HelpRequestListItemDto>>
    {
        public int Page { get; }
        public int PageSize { get; }

        public GetHelpRequestsPageQuery(int page, int pageSize)
        {
            Page = page < 1 ? 1 : page;
            PageSize = pageSize is < 1 or > 50 ? 10 : pageSize;
        }
    }
}
