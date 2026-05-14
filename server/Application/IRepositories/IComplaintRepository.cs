using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Domain.ReviewAndComplaints;

namespace server.Application.IRepositories
{
    public interface IComplaintRepository
    {
        Task AddAsync(UserComplaint complaint, CancellationToken ct);
        Task<List<AdminComplaintDto>> GetAllForAdminAsync(bool? isResolved, CancellationToken ct);
        Task<bool> MarkAsResolvedAsync(Guid complaintId, string? adminComment, CancellationToken ct);
        Task<UserComplaint?> GetByIdAsync(Guid complaintId, CancellationToken ct);
        Task<int> GetCountByUserInLast24HoursAsync(Guid userId, CancellationToken ct);
        Task<bool> HasActiveComplaintOnTargetAsync(Guid reporterId, Guid targetUserId, CancellationToken ct);
    }

}
