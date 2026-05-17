using Dapper;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.UserAndVolunteer;

namespace server.Infrastructure.Repositories
{
    public class EmailVerificationTokenRepository : IEmailVerificationTokenRepository
    {
        private readonly ISqlConnectionFactory _cf;
        public EmailVerificationTokenRepository(ISqlConnectionFactory cf) => _cf = cf;

        public async Task AddAsync(EmailVerificationToken token, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync("""
                INSERT INTO EmailVerificationTokens
                    (Id, UserId, Token, ExpiresAtUtc, IsUsed, CreatedAtUtc)
                VALUES
                    (@Id, @UserId, @Token, @ExpiresAtUtc, @IsUsed, @CreatedAtUtc)
                """, token);
        }

        public async Task<EmailVerificationToken?> GetByTokenAsync(string token, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            return await conn.QuerySingleOrDefaultAsync<EmailVerificationToken>(
                "SELECT * FROM EmailVerificationTokens WHERE Token = @Token",
                new { Token = token });
        }

        public async Task<EmailVerificationToken?> GetLatestByUserIdAsync(Guid userId, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            return await conn.QueryFirstOrDefaultAsync<EmailVerificationToken>("""
                SELECT TOP 1 * FROM EmailVerificationTokens
                WHERE UserId = @UserId
                ORDER BY CreatedAtUtc DESC
                """, new { UserId = userId });
        }

        public async Task MarkAsUsedAsync(Guid tokenId, CancellationToken ct)
        {
            using var conn = await _cf.CreateOpenConnectionAsync(ct);
            await conn.ExecuteAsync(
                "UPDATE EmailVerificationTokens SET IsUsed = 1 WHERE Id = @Id",
                new { Id = tokenId });
        }
    }
}
