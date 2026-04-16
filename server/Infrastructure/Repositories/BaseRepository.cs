using Dapper;
using server.Domain.HelpRequest;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public abstract class BaseRepository
    {
        protected static async Task InsertEventAsync(
            IDbConnection connection,
            IDbTransaction tx,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            const string sql = """
                INSERT INTO HelpRequestEventLog
                    (Id, HelpRequestId, ActorId, EventType, Payload, CreatedAtUtc)
                VALUES
                    (@Id, @HelpRequestId, @ActorId, @EventType, @Payload, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(new CommandDefinition(
                sql,
                new
                {
                    logEvent.Id,
                    logEvent.HelpRequestId,
                    logEvent.ActorId,
                    EventType = (int)logEvent.EventType,
                    logEvent.Payload,
                    logEvent.CreatedAtUtc
                },
                transaction: tx,
                cancellationToken: ct));
        }
    }
}
