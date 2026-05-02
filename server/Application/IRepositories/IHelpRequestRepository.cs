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
        Task<HelpRequest?> GetAggregateByIdAsync(CancellationToken ct, Guid id);
        Task UpdateStatusAsync(CancellationToken ct, Guid id, HelpRequestStatus status, HelpRequestEvent logEvent);
        Task UpdateAsync(HelpRequest request, HelpRequestEvent logEvent, CancellationToken ct);
        Task AssignExecutorAsync(HelpRequest request, Chat chat, HelpRequestStage firstStage, HelpRequestEvent logEvent, CancellationToken ct);
        Task AddResponseAsync(Guid helpRequestId, HelpRequestResponse response, CancellationToken ct);
        Task<Guid?> GetCreatorIdAsync(CancellationToken ct, Guid helpRequestId);
        Task<IReadOnlyList<HelpRequestResponseDto>> GetResponsesByHelpRequestIdAsync(CancellationToken ct, Guid helpRequestId);
        Task EditAsync(HelpRequest request, HelpRequestEvent logEvent, CancellationToken ct);
        Task SoftDeleteAsync(Guid id, CancellationToken ct);
        Task CancelAsync(HelpRequest request, HelpRequestEvent logEvent, CancellationToken ct);
        Task RestoreAsync(HelpRequest request, HelpRequestEvent logEvent, CancellationToken ct);
        Task<bool> HasActiveRequestsAsOwnerAsync(Guid userId, CancellationToken ct);
        Task<bool> HasActiveRequestsAsAssigneeAsync(Guid userId, CancellationToken ct);
        Task CancelResponseAsync(Guid helpRequestId, Guid userId, CancellationToken ct);
        Task ResignAsExecutorAsync(HelpRequest request, Chat chat, HelpRequestEvent logEvent, CancellationToken ct);
        Task RemoveExecutorAsync(HelpRequest request, Chat chat, HelpRequestEvent logEvent, CancellationToken ct);
    }
}
