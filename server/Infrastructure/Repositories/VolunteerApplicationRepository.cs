using Dapper;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.UserAndVolunteer;

namespace server.Infrastructure.Repositories
{
    public class VolunteerApplicationRepository : IVolunteerApplicationRepository
    {
        private readonly ISqlConnectionFactory _cf;
        public VolunteerApplicationRepository(ISqlConnectionFactory cf) => _cf = cf;

        public async Task AddAsync(VolunteerApplication app, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync("""
                INSERT INTO VolunteerApplications
                    (Id, UserId, OrganizationName, ActivityDescription,
                     DocumentImageUrl, Status, SubmittedAtUtc)
                VALUES
                    (@Id, @UserId, @OrganizationName, @ActivityDescription,
                     @DocumentImageUrl, @Status, @SubmittedAtUtc)
                """, app);
        }

        public async Task<VolunteerApplication?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            return await conn.QuerySingleOrDefaultAsync<VolunteerApplication>(
                "SELECT * FROM VolunteerApplications WHERE Id = @Id", new { Id = id });
        }

        public async Task<VolunteerApplication?> GetPendingByUserIdAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            return await conn.QueryFirstOrDefaultAsync<VolunteerApplication>(
                "SELECT * FROM VolunteerApplications WHERE UserId = @UserId AND Status = 0",
                new { UserId = userId });
        }

        public async Task<List<VolunteerApplicationDto>> GetAllAsync(int? status, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            var sql = """
                SELECT va.Id, va.UserId, u.Username, va.OrganizationName,
                       va.ActivityDescription, va.DocumentImageUrl, va.Status,
                       va.AdminComment, va.SubmittedAtUtc, va.ReviewedAtUtc
                FROM VolunteerApplications va
                INNER JOIN Users u ON u.Id = va.UserId
                """;

            if (status.HasValue)
                sql += " WHERE va.Status = @Status";

            sql += " ORDER BY va.SubmittedAtUtc DESC";

            var rows = await conn.QueryAsync<VolunteerApplicationDto>(sql, new { Status = status });
            return rows.AsList();
        }

        public async Task UpdateAsync(VolunteerApplication app, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync("""
                UPDATE VolunteerApplications
                SET Status = @Status, AdminComment = @AdminComment,
                    ReviewedAtUtc = @ReviewedAtUtc, ReviewedByAdminId = @ReviewedByAdminId
                WHERE Id = @Id
                """, app);
        }

        public async Task<VolunteerApplicationDto?> GetLatestByUserIdAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            return await conn.QueryFirstOrDefaultAsync<VolunteerApplicationDto>("""
                SELECT TOP 1 va.Id, va.UserId, u.Username, va.OrganizationName,
                       va.ActivityDescription, va.DocumentImageUrl, va.Status,
                       va.AdminComment, va.SubmittedAtUtc, va.ReviewedAtUtc
                FROM VolunteerApplications va
                INNER JOIN Users u ON u.Id = va.UserId
                WHERE va.UserId = @UserId
                ORDER BY va.SubmittedAtUtc DESC
        """, new { UserId = userId });
        }
    }
}
