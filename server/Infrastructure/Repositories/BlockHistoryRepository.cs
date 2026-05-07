using Dapper;
using server.Application.Handlers.UserHandlers.GetBlockHistory;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.UserAndVolunteer;

namespace server.Infrastructure.Repositories
{
    public class BlockHistoryRepository : IBlockHistoryRepository
    {
        private readonly ISqlConnectionFactory _cf;
        public BlockHistoryRepository(ISqlConnectionFactory cf) => _cf = cf;

        public async Task AddAsync(UserBlockRecord record, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync("""
                INSERT INTO UserBlockHistory
                    (Id, UserId, AdminId, Reason, BlockedUntilUtc, CreatedAtUtc)
                VALUES
                    (@Id, @UserId, @AdminId, @Reason, @BlockedUntilUtc, @CreatedAtUtc)
                """, record);
        }

        public async Task<List<BlockHistoryDto>> GetByUserIdAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            var rows = await conn.QueryAsync<BlockHistoryDto>("""
                SELECT bh.Id, u.Username AS AdminUsername,
                       bh.Reason, bh.BlockedUntilUtc, bh.CreatedAtUtc
                FROM UserBlockHistory bh
                INNER JOIN Users u ON u.Id = bh.AdminId
                WHERE bh.UserId = @UserId
                ORDER BY bh.CreatedAtUtc DESC
                """, new { UserId = userId });
            return rows.AsList();
        }
    }
}
