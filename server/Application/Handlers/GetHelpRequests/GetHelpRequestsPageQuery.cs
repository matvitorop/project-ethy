using MediatR;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetActiveRequests
{
    public sealed class GetHelpRequestsPageQuery
    : IRequest<Result<IReadOnlyList<HelpRequestListItemDto>>>
    {
        public int Page { get; }
        public int PageSize { get; }
        public HelpRequestStatus? Status { get; }
        public IReadOnlyList<HelpRequestStatus>? Statuses { get; }
        public Guid? CreatorId { get; } 
        public Guid? AssignedUserId { get; }
        public bool? HasNoReport { get; }
        public string? SearchTerm { get; }
        public string? ShortId { get; }


        public GetHelpRequestsPageQuery(
            int page,
            int pageSize,
            HelpRequestStatus? status = null,
            IReadOnlyList<HelpRequestStatus>? statuses = null, 
            Guid? creatorId = null, 
            Guid? assignedUserId = null,
            bool? hasNoReport = null,
            string? searchTerm = null,
            string? shortId = null)
        {
            Page = page < 1 ? 1 : page;
            PageSize = pageSize is < 1 or > 50 ? 10 : pageSize;
            Status = status;
            Statuses = statuses;
            CreatorId = creatorId;
            AssignedUserId = assignedUserId;
            HasNoReport = hasNoReport;
            SearchTerm = searchTerm;
            ShortId = shortId;
        }
    }
}
