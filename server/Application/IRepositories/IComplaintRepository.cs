using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Domain.ReviewAndComplaints;

namespace server.Application.IRepositories
{
    public interface IComplaintRepository
    {
        Task AddAsync(UserComplaint complaint, CancellationToken ct);
        Task<List<AdminComplaintDto>> GetAllForAdminAsync(bool? isResolved, CancellationToken ct);
        Task<bool> MarkAsResolvedAsync(Guid complaintId, string? adminComment, CancellationToken ct);
    }

}
