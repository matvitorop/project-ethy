using Dapper;
using server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity;
using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;
using server.Application.IRepositories;
using server.Application.IServices;

namespace server.Infrastructure.Repositories
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly ISqlConnectionFactory _cf;

        public StatisticsRepository(ISqlConnectionFactory cf) => _cf = cf;

        public async Task<PlatformStatsDto> GetPlatformStatsAsync(CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    COUNT(*)                                                          AS TotalRequests,
                    SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END)                      AS DraftRequests,
                    SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END)                      AS OpenRequests,
                    SUM(CASE WHEN Status = 2 THEN 1 ELSE 0 END)                      AS InProgressRequests,
                    SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END)                      AS ResolvedRequests,
                    SUM(CASE WHEN Status = 4 THEN 1 ELSE 0 END)                      AS CancelledRequests,
                    ISNULL(
                        CAST(SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END) AS FLOAT)
                        / NULLIF(COUNT(*), 0) * 100, 0)                              AS CompletionRate,
                    ISNULL(AVG(
                        CASE WHEN Status = 3 AND ResolvedAtUtc IS NOT NULL
                             THEN CAST(DATEDIFF(hour, CreatedAtUtc, ResolvedAtUtc) AS FLOAT) / 24.0
                             ELSE NULL END), 0)                                       AS AvgCompletionDays
                FROM HelpRequests
                WHERE IsDeleted = 0;

                SELECT COUNT(*) FROM Users WHERE IsDeleted = 0 AND IsEmailVerified = 1;

                SELECT COUNT(*) FROM Users WHERE Role = 2 AND IsDeleted = 0;
                """;

            using var multi = await conn.QueryMultipleAsync(sql);

            var raw = await multi.ReadSingleAsync();
            int totalUsers = await multi.ReadSingleAsync<int>();
            int volunteers = await multi.ReadSingleAsync<int>();

            return new PlatformStatsDto(
                TotalRequests: (int)raw.TotalRequests,
                DraftRequests: (int)raw.DraftRequests,
                OpenRequests: (int)raw.OpenRequests,
                InProgressRequests: (int)raw.InProgressRequests,
                ResolvedRequests: (int)raw.ResolvedRequests,
                CancelledRequests: (int)raw.CancelledRequests,
                TotalUsers: totalUsers,
                TotalVolunteers: volunteers,
                CompletionRate: Math.Round((double)raw.CompletionRate, 1),
                AvgCompletionDays: Math.Round((double)raw.AvgCompletionDays, 1)
            );
        }

        public async Task<List<MonthlyActivityDto>> GetMonthlyActivityAsync(CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    YEAR(CreatedAtUtc)  AS Year,
                    MONTH(CreatedAtUtc) AS Month,
                    COUNT(*)            AS Count
                FROM HelpRequests
                WHERE CreatedAtUtc >= DATEADD(month, -11, DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1))
                  AND IsDeleted = 0
                GROUP BY YEAR(CreatedAtUtc), MONTH(CreatedAtUtc)
                ORDER BY Year, Month;
                """;

            var rows = await conn.QueryAsync<MonthlyActivityDto>(sql);
            return rows.AsList();
        }

        public async Task<TopVolunteersDto> GetTopVolunteersAsync(int limit, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);

            var byCompletedSql = $"""
                SELECT TOP {limit}
                    hr.AssignedUserId   AS UserId,
                    u.Username,
                    COUNT(*)            AS CompletedCount
                FROM HelpRequests hr
                INNER JOIN Users u ON u.Id = hr.AssignedUserId
                WHERE hr.Status = 3
                  AND hr.AssignedUserId IS NOT NULL
                  AND hr.IsDeleted = 0
                GROUP BY hr.AssignedUserId, u.Username
                ORDER BY CompletedCount DESC;
                """;

            var byReviewsSql = $"""
                SELECT TOP {limit}
                    r.TargetUserId  AS UserId,
                    u.Username,
                    COUNT(*)        AS PositiveReviews
                FROM UserReviews r
                INNER JOIN Users u ON u.Id = r.TargetUserId
                WHERE r.IsPositive = 1
                GROUP BY r.TargetUserId, u.Username
                ORDER BY PositiveReviews DESC;
                """;

            var byCompleted = (await conn.QueryAsync<TopVolunteerByCompletedDto>(byCompletedSql)).AsList();
            var byReviews = (await conn.QueryAsync<TopVolunteerByReviewsDto>(byReviewsSql)).AsList();

            return new TopVolunteersDto(byCompleted, byReviews);
        }
    }
}
