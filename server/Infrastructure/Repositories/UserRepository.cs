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

        public async Task<UserStatisticsDto?> GetUserStatisticsAsync(Guid userId, CancellationToken ct)
        {
            using var connection =
                await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT 
                    u.RegisteredAtUtc,

                    COUNT(hr.Id) AS TotalRequests,

                    SUM(CASE 
                            WHEN hr.Status IN (0,2) THEN 1 
                            ELSE 0 
                        END) AS ActiveRequests,

                    SUM(CASE 
                            WHEN hr.Status IN (3,4) THEN 1 
                            ELSE 0 
                        END) AS CompletedRequests

                FROM Users u
                LEFT JOIN HelpRequests hr 
                    ON hr.CreatorId = u.Id

                WHERE u.Id = @UserId

                GROUP BY u.RegisteredAtUtc;
                """;

            return await connection.QuerySingleOrDefaultAsync<UserStatisticsDto>(
                new CommandDefinition(
                    sql,
                    new { UserId = userId },
                    cancellationToken: ct));
        }
    }
}
