using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Domain.UserAndVolunteer;

namespace server.Application.IRepositories
{
    public interface IVolunteerApplicationRepository
    {
        Task AddAsync(VolunteerApplication application, CancellationToken ct);
        Task<VolunteerApplication?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<VolunteerApplication?> GetPendingByUserIdAsync(Guid userId, CancellationToken ct);
        Task<List<VolunteerApplicationDto>> GetAllAsync(int? status, CancellationToken ct);
        Task UpdateAsync(VolunteerApplication application, CancellationToken ct);
    }
}
