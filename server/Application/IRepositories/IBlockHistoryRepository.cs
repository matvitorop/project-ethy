using server.Domain.UserAndVolunteer;

namespace server.Application.IRepositories
{
    public interface IBlockHistoryRepository
    {
        Task AddAsync(UserBlockRecord record, CancellationToken ct);
        Task<List<BlockHistoryDto>> GetByUserIdAsync(Guid userId, CancellationToken ct);
    }
}
