using Dapper;
using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.ReviewAndComplaints;

namespace server.Infrastructure.Repositories
{
    public class ComplaintRepository : IComplaintRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ComplaintRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(UserComplaint complaint, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO UserComplaints
                    (Id, ReporterUserId, TargetUserId, Reason, CreatedAtUtc)
                VALUES
                    (@Id, @ReporterUserId, @TargetUserId, @Reason, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(sql, complaint, cancellationToken: ct));
        }

        public async Task<List<AdminComplaintDto>> GetAllForAdminAsync(bool? isResolved, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            var sql = """
                SELECT c.Id,
                       c.ReporterUserId, r.Username AS ReporterUsername,
                       c.TargetUserId,   t.Username AS TargetUsername,
                       c.Reason, c.IsResolved, c.CreatedAtUtc
                FROM UserComplaints c
                INNER JOIN Users r ON r.Id = c.ReporterUserId
                INNER JOIN Users t ON t.Id = c.TargetUserId
                """;

            if (isResolved.HasValue)
                sql += " WHERE c.IsResolved = @IsResolved";

            sql += " ORDER BY c.CreatedAtUtc DESC";

            var rows = await conn.QueryAsync<AdminComplaintDto>(sql, new { IsResolved = isResolved });
            return rows.AsList();
        }

        public async Task<bool> MarkAsResolvedAsync(
            Guid complaintId, string? adminComment, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            
            var affected = await conn.ExecuteAsync("""
                UPDATE UserComplaints 
                SET IsResolved = 1, AdminComment = @AdminComment 
                WHERE Id = @Id
                """,
                new { Id = complaintId, AdminComment = adminComment });
            return affected > 0;
        }
    }

}
