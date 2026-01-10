using Dapper;
using Microsoft.Data.SqlClient;
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
                Role
            )
            OUTPUT INSERTED.*
            VALUES (
                @Id,
                @Username,
                @Email,
                @PasswordHash,
                @PasswordSalt,
                @Role
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
                Role
            FROM Users
            WHERE Email = @Email
        """;

            return await connection.QuerySingleOrDefaultAsync<User>(
                sql,
                new { Email = email });
        }
    }
}
