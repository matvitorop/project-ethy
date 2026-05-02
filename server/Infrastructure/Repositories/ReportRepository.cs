using Dapper;
using server.Application.Handlers.HelpRequestResponseHandlers.GetReports;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;

namespace server.Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ReportRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(HelpRequestReport report, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO HelpRequestReports
                    (Id, HelpRequestId, CreatedByUserId, Comment, ImageUrl, CreatedAtUtc)
                VALUES
                    (@Id, @HelpRequestId, @CreatedByUserId, @Comment, @ImageUrl, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(sql, report, cancellationToken: ct));
        }

        public async Task<IReadOnlyList<ReportDto>> GetByHelpRequestIdAsync(
            Guid helpRequestId,
            Guid? lastAssignedUserId,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, CreatedByUserId, Comment, ImageUrl, CreatedAtUtc
                FROM HelpRequestReports
                WHERE HelpRequestId = @HelpRequestId
                ORDER BY CreatedAtUtc ASC;
                """;

            var rows = await connection.QueryAsync<ReportRow>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            return rows.Select(r => new ReportDto(
                r.Id,
                r.CreatedByUserId,
                lastAssignedUserId,
                r.Comment,
                r.ImageUrl,
                r.CreatedAtUtc)).AsList();
        }

        private sealed class ReportRow
        {
            public Guid Id { get; init; }
            public Guid CreatedByUserId { get; init; }
            public string Comment { get; init; } = null!;
            public string? ImageUrl { get; init; }
            public DateTime CreatedAtUtc { get; init; }
        }
    }
}
