using server.Application.Handlers.GetActiveRequests;
using server.Domain.HelpRequest;

namespace server.Application.IRepositories
{
    public interface IHelpRequestRepository
    {
        Task AddAsync(HelpRequest request, CancellationToken ct);
        Task<IReadOnlyList<HelpRequestListItemDto>> GetPageAsync(int page, int pageSize, CancellationToken ct);
    }
}
