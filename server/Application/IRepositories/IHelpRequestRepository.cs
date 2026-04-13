using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetFullHelpRequest;
using server.Application.Handlers.GetHelpRequestResponses;
using server.Domain.Chat;
using server.Domain.HelpRequest;

namespace server.Application.IRepositories
{
    public interface IHelpRequestRepository
    {
        Task AddAsync(HelpRequest request, CancellationToken ct);
        Task<IReadOnlyList<HelpRequestListItemDto>> GetPageAsync(CancellationToken ct, int page, int pageSize);
        Task<HelpRequestDetailDto?> GetHelpRequestById(CancellationToken ct, Guid id);

        // Think about this methods
        Task<HelpRequest?> GetAggregateByIdAsync(CancellationToken ct, Guid id);
        Task UpdateStatusAsync(CancellationToken ct, Guid id, HelpRequestStatus status);
        
        // Rethink this method
        Task UpdateAsync(HelpRequest request, CancellationToken ct);
        
        Task AssignExecutorAsync(HelpRequest request, Chat chat, CancellationToken ct);

        Task AddResponseAsync(Guid helpRequestId, HelpRequestResponse response, CancellationToken ct);

        Task<Guid?> GetCreatorIdAsync(CancellationToken ct, Guid helpRequestId);
        Task<IReadOnlyList<HelpRequestResponseDto>> GetResponsesByHelpRequestIdAsync(
            CancellationToken ct, Guid helpRequestId);
    }
}
