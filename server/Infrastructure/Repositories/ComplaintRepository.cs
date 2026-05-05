using Dapper;
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
    }

}
