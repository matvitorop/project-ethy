using Dapper;
using Microsoft.Data.SqlClient;
using server.Application.Handlers.AdminHandlers.AdminGetUsers;
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
                    HasActiveRequestLimit,
                    IsEmailVerified,
                    BlockedUntilUtc,
                    BlockReason,
                    LastActivityAtUtc
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
                    PhoneNumber, SocialLinks, IsEmailVerified,
                    LastActivityAtUtc
                FROM Users
                WHERE Id = @Id;
                """;

            return await connection.QuerySingleOrDefaultAsync<User>(
                new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
        }

        // Trust module: запит з лічильниками відгуків
        public async Task<UserStatisticsDto?> GetUserStatisticsAsync(Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT
                    u.RegisteredAtUtc,
                    (SELECT COUNT(*) FROM HelpRequests WHERE CreatorId = u.Id AND IsDeleted = 0) AS TotalRequests,
                    (SELECT COUNT(*) FROM HelpRequests WHERE CreatorId = u.Id AND IsDeleted = 0 AND Status IN (1, 2)) AS ActiveRequests,
                    (SELECT COUNT(*) FROM HelpRequests WHERE CreatorId = u.Id AND Status = 3) AS CompletedRequests,
                    (SELECT COUNT(*) FROM HelpRequests WHERE CreatorId = u.Id AND Status = 4) AS RejectedRequests,
                    (SELECT COUNT(*) FROM HelpRequests WHERE AssignedUserId = u.Id AND Status = 3) AS HelpedRequests,
                    (SELECT COUNT(*) FROM UserReviews WHERE TargetUserId = u.Id AND IsPositive = 1) AS PositiveReviews,
                    (SELECT COUNT(*) FROM UserReviews WHERE TargetUserId = u.Id AND IsPositive = 0) AS NegativeReviews
                FROM Users u
                WHERE u.Id = @UserId;
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
                WHERE Id = @Id AND Role = @Role;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql, new { Id = userId, Role = (int)UserRole.Admin }, cancellationToken: ct));

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

        public async Task VerifyEmailAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE Users SET IsEmailVerified = 1 WHERE Id = @Id",
                new { Id = userId });
        }

        public async Task UpdateLastVolunteerApplicationDateAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE Users SET LastVolunteerApplicationAtUtc = @Now WHERE Id = @Id",
                new { Id = userId, Now = DateTime.UtcNow });
        }

        public async Task UpdateRoleAsync(Guid userId, UserRole role, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE Users SET Role = @Role WHERE Id = @Id",
                new { Id = userId, Role = (int)role });
        }

        public async Task BlockAsync(
            Guid userId, DateTime? blockedUntilUtc, string reason, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync("""
                UPDATE Users
                SET BlockedUntilUtc = @BlockedUntilUtc, BlockReason = @BlockReason
                WHERE Id = @Id
        """, new { Id = userId, BlockedUntilUtc = blockedUntilUtc, BlockReason = reason });
        }

        public async Task<IReadOnlyList<AdminUserDto>> GetUsersPageAsync(int page, int pageSize, string? searchTerm, string? shortId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            var offset = (page - 1) * pageSize;

            var filters = new List<string> { "Role <> 0" };
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                filters.Add("(Username LIKE @SearchTerm OR Email LIKE @SearchTerm)");
            }
            if (!string.IsNullOrWhiteSpace(shortId))
            {
                filters.Add("CAST(Id AS NVARCHAR(36)) LIKE '%' + @ShortId");
            }

            var filterClause = string.Join(" AND ", filters);

            var sql = $"""
                SELECT 
                    Id, Username, Email, Role, RegisteredAtUtc,
                    CAST(CASE WHEN BlockedUntilUtc IS NOT NULL AND (BlockedUntilUtc > GETUTCDATE() OR BlockedUntilUtc = '9999-12-31') THEN 1 ELSE 0 END AS BIT) as IsBlocked,
                    BlockedUntilUtc,
                    IsDeleted,
                    LastActivityAtUtc
                FROM Users
                WHERE {filterClause}
                ORDER BY RegisteredAtUtc DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
                """;

            var result = await connection.QueryAsync<AdminUserDto>(
                sql,
                new
                {
                    Offset = offset,
                    PageSize = pageSize,
                    SearchTerm = $"%{searchTerm}%",
                    ShortId = shortId
                }
            );

            return result.ToList();
        }

        public async Task UnblockAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE Users SET BlockedUntilUtc = NULL, BlockReason = NULL WHERE Id = @Id",
                new { Id = userId });
        }

        public async Task UpdateLastActivityAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _connectionFactory.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE Users SET LastActivityAtUtc = @Now WHERE Id = @Id",
                new { Id = userId, Now = DateTime.UtcNow });
        }
    }
}
