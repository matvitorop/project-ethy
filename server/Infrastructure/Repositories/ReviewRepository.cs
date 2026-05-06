using Dapper;
using server.Application.Handlers.UserHandlers.GetUserReviews;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.ReviewAndComplaints;

namespace server.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ReviewRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(UserReview review, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO UserReviews
                    (Id, HelpRequestId, ReviewerUserId, TargetUserId, IsPositive, Comment, CreatedAtUtc)
                VALUES
                    (@Id, @HelpRequestId, @ReviewerUserId, @TargetUserId, @IsPositive, @Comment, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(sql, review, cancellationToken: ct));
        }

        public async Task<bool> ExistsAsync(
            Guid helpRequestId, Guid reviewerUserId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM UserReviews
                WHERE HelpRequestId = @HelpRequestId
                  AND ReviewerUserId = @ReviewerUserId;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(
                    sql,
                    new { HelpRequestId = helpRequestId, ReviewerUserId = reviewerUserId },
                    cancellationToken: ct));

            return count > 0;
        }

        public async Task<IEnumerable<UserReviewDto>> GetByTargetUserAsync(
            Guid targetUserId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    r.Id,
                    r.HelpRequestId,
                    r.ReviewerUserId,
                    u.Username AS ReviewerUsername,
                    r.IsPositive,
                    r.Comment,
                    r.CreatedAtUtc
                FROM UserReviews r
                INNER JOIN Users u ON u.Id = r.ReviewerUserId
                WHERE r.TargetUserId = @TargetUserId
                ORDER BY r.CreatedAtUtc DESC;
                """;

            return await connection.QueryAsync<UserReviewDto>(
                new CommandDefinition(
                    sql,
                    new { TargetUserId = targetUserId },
                    cancellationToken: ct));
        }

    }
}
