using Dapper;
using server.Application.Handlers.GetStages;
using server.Application.Handlers.GetStageTemplates;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;

namespace server.Infrastructure.Repositories
{
    public class StageRepository : BaseRepository, IStageRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public StageRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<bool> HasAnyProposedStageAsync(
            Guid helpRequestId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM HelpRequestStages
                WHERE HelpRequestId = @HelpRequestId
                  AND Status = 0;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            return count > 0;
        }

        public async Task<bool> HasActiveProposedStageAsync(
            Guid helpRequestId, Guid chatId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM HelpRequestStages
                WHERE HelpRequestId = @HelpRequestId
                  AND ChatId = @ChatId
                  AND Status = 0;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId, ChatId = chatId },
                    cancellationToken: ct));

            return count > 0;
        }

        public async Task AddAsync(
            HelpRequestStage stage,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string insertStage = """
                    INSERT INTO HelpRequestStages
                        (Id, HelpRequestId, ChatId, ProposedByUserId,
                         Content, Status, RejectionReason, CreatedAtUtc, ResolvedAtUtc)
                    VALUES
                        (@Id, @HelpRequestId, @ChatId, @ProposedByUserId,
                         @Content, @Status, @RejectionReason, @CreatedAtUtc, @ResolvedAtUtc);
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    insertStage,
                    new
                    {
                        stage.Id,
                        stage.HelpRequestId,
                        stage.ChatId,
                        stage.ProposedByUserId,
                        stage.Content,
                        Status = (int)stage.Status,
                        stage.RejectionReason,
                        stage.CreatedAtUtc,
                        stage.ResolvedAtUtc
                    },
                    transaction: tx, cancellationToken: ct));

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task UpdateAsync(
            HelpRequestStage stage,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string updateStage = """
                    UPDATE HelpRequestStages
                    SET Status = @Status,
                        RejectionReason = @RejectionReason,
                        ResolvedAtUtc = @ResolvedAtUtc
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    updateStage,
                    new
                    {
                        stage.Id,
                        Status = (int)stage.Status,
                        stage.RejectionReason,
                        stage.ResolvedAtUtc
                    },
                    transaction: tx, cancellationToken: ct));

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task<HelpRequestStage?> GetByIdAsync(Guid stageId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, HelpRequestId, ChatId, ProposedByUserId,
                       Content, Status, RejectionReason, CreatedAtUtc, ResolvedAtUtc
                FROM HelpRequestStages
                WHERE Id = @Id;
                """;

            var row = await connection.QuerySingleOrDefaultAsync<StageRow>(
                new CommandDefinition(sql, new { Id = stageId }, cancellationToken: ct));

            if (row is null) return null;

            return new HelpRequestStage(
                row.Id, row.HelpRequestId, row.ChatId, row.ProposedByUserId,
                row.Content, row.Status, row.RejectionReason,
                row.CreatedAtUtc, row.ResolvedAtUtc);
        }

        public async Task<IReadOnlyList<StageDto>> GetStagesAsync(
            Guid helpRequestId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, ProposedByUserId, Content, Status,
                       RejectionReason, CreatedAtUtc, ResolvedAtUtc
                FROM HelpRequestStages
                WHERE HelpRequestId = @HelpRequestId
                  AND Status IN (0, 1)
                ORDER BY CreatedAtUtc ASC;
                """;

            var result = await connection.QueryAsync<StageDto>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            return result.AsList();
        }

        public async Task<IReadOnlyList<EventLogDto>> GetEventLogAsync(
            Guid helpRequestId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, ActorId, EventType, Payload, CreatedAtUtc
                FROM HelpRequestEventLog
                WHERE HelpRequestId = @HelpRequestId
                ORDER BY CreatedAtUtc ASC;
                """;

            var result = await connection.QueryAsync<EventLogDto>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            return result.AsList();
        }
        public async Task<IReadOnlyList<StageTemplateDto>> GetTemplatesAsync(CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, Content, IsAutomatic
                FROM StageTemplates
                WHERE IsAutomatic = 0
                ORDER BY Content ASC;
                """;

            var result = await connection.QueryAsync<StageTemplateDto>(
                new CommandDefinition(sql, cancellationToken: ct));

            return result.AsList();
        }
        private sealed class StageRow
        {
            public Guid Id { get; init; }
            public Guid HelpRequestId { get; init; }
            public Guid ChatId { get; init; }
            public Guid ProposedByUserId { get; init; }
            public string Content { get; init; } = null!;
            public int Status { get; init; }
            public string? RejectionReason { get; init; }
            public DateTime CreatedAtUtc { get; init; }
            public DateTime? ResolvedAtUtc { get; init; }
        }
    }
}
