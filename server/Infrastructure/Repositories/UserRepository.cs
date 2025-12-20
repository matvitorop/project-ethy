using server.Application.IRepositories;
using server.Domain;
using System.Data;
using Dapper;

namespace server.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {

        private readonly IDbConnection _connection;

        public UserRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<User?> AddAsync(User user)
        {
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

            var newUser = await _connection.QuerySingleAsync<User>(sql, user);
            
            return newUser;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
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

            return await _connection.QuerySingleOrDefaultAsync<User>(
                sql,
                new { Email = email });
        }
    }
}
