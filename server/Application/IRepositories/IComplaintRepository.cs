using server.Domain.ReviewAndComplaints;

namespace server.Application.IRepositories
{
    public interface IComplaintRepository
    {
        Task AddAsync(UserComplaint complaint, CancellationToken ct);
    }

}
