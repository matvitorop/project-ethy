using Dapper;
using Microsoft.Data.SqlClient;
using server.Application.Handlers.GetUserStatistics;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public UserRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<User?> AddAsync(User user)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
            INSERT INTO Users (
                Id,
                Username,
                Email,
                PasswordHash,
                PasswordSalt,
                Role,
                RegisteredAtUtc,
                HasActiveRequestLimit
            )
            OUTPUT INSERTED.*
            VALUES (
                @Id,
                @Username,
                @Email,
                @PasswordHash,
                @PasswordSalt,
                @Role,
                @RegisteredAtUtc,
                @HasActiveRequestLimit
            )
            """;

            var newUser = await connection.QuerySingleAsync<User>(sql, user);
            return newUser;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT
                    Id,
                    Username,
                    Email,
                    PasswordHash,
                    PasswordSalt,
                    Role,
                    RegisteredAtUtc,
                    HasActiveRequestLimit
                FROM Users
                WHERE Email = @Email
                """;

            return await connection.QuerySingleOrDefaultAsync<User>(
                sql, 
                new { Email = email });
        }

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    Id, Username, Email, PasswordHash, PasswordSalt,
                    Role, RegisteredAtUtc,
                    PhoneNumber, SocialLinks, IsEmailVerified
                FROM Users
                WHERE Id = @Id;
                """;

            return await connection.QuerySingleOrDefaultAsync<User>(
                new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
        }

        // +++ Trust module: оновлений запит з лічильниками відгуків
        public async Task<UserStatisticsDto?> GetUserStatisticsAsync(Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    u.RegisteredAtUtc,
 
                    COUNT(DISTINCT hr.Id) AS TotalRequests,
 
                    SUM(CASE
                            WHEN hr.Status IN (1, 2) THEN 1
                            ELSE 0
                        END) AS ActiveRequests,
 
                    SUM(CASE
                            WHEN hr.Status = 3 THEN 1
                            ELSE 0
                        END) AS CompletedRequests,
 
                    SUM(CASE
                            WHEN rv.IsPositive = 1 THEN 1
                            ELSE 0
                        END) AS PositiveReviews,
 
                    SUM(CASE
                            WHEN rv.IsPositive = 0 THEN 1
                            ELSE 0
                        END) AS NegativeReviews
 
                FROM Users u
                LEFT JOIN HelpRequests hr ON hr.CreatorId = u.Id
                LEFT JOIN UserReviews rv ON rv.TargetUserId = u.Id
 
                WHERE u.Id = @UserId
 
                GROUP BY u.RegisteredAtUtc;
                """;

            return await connection.QuerySingleOrDefaultAsync<UserStatisticsDto>(
                new CommandDefinition(
                    sql,
                    new { UserId = userId },
                    cancellationToken: ct));
        }

        public async Task UpdateUsernameAsync(Guid id, string username, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE Users SET Username = @Username WHERE Id = @Id;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(sql, new { Id = id, Username = username }, cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException($"User with id '{id}' not found.");
        }

        public async Task UpdatePasswordAsync(Guid id, string passwordHash, string passwordSalt, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE Users
                SET PasswordHash = @PasswordHash, PasswordSalt = @PasswordSalt
                WHERE Id = @Id;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { Id = id, PasswordHash = passwordHash, PasswordSalt = passwordSalt },
                    cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException($"User with id '{id}' not found.");
        }

        // +++ Trust module
        public async Task UpdateProfileAsync(
            Guid id, string? phoneNumber, string? socialLinks, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE Users
                SET PhoneNumber = @PhoneNumber,
                    SocialLinks = @SocialLinks
                WHERE Id = @Id;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { Id = id, PhoneNumber = phoneNumber, SocialLinks = socialLinks },
                    cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException(
                    $"User with id '{id}' not found.");
        }
        // ---

        public async Task<bool> IsAdminAsync(Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM Users 
                WHERE Id = @Id AND Role = 'Admin';
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql, new { Id = userId }, cancellationToken: ct));

            return count > 0;
        }

        public async Task SoftDeleteAsync(User user, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE Users
                SET IsDeleted    = 1,
                    DeletedAtUtc = @DeletedAtUtc,
                    DeletedById  = @DeletedById
                WHERE Id = @Id;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new
                    {
                        Id = user.Id, 
                        user.DeletedAtUtc, 
                        user.DeletedById 
                    },
                    cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException(
                    $"User with id '{user.Id}' not found.");
        }
    }
}
