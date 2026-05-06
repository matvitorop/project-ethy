using Dapper;
using server.Application.IServices;
using server.Application.Services;
using server.Domain;

namespace server.Infrastructure
{
    /// <summary>
    /// Запускається при старті. Створює адміна якщо жодного немає.
    /// Credentials беруться з конфігурації (AdminSeed:Email / AdminSeed:Password).
    /// </summary>
    public class AdminSeeder : IHostedService
    {
        private readonly ISqlConnectionFactory _connectionFactory;
        private readonly IPasswordHasher _hasher;
        private readonly IConfiguration _config;
        private readonly ILogger<AdminSeeder> _logger;

        public AdminSeeder(
            ISqlConnectionFactory connectionFactory,
            IPasswordHasher hasher,
            IConfiguration config,
            ILogger<AdminSeeder> logger)
        {
            _connectionFactory = connectionFactory;
            _hasher = hasher;
            _config = config;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var email = _config["AdminSeed:Email"];
            var password = _config["AdminSeed:Password"];

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("AdminSeed credentials not configured. Skipping admin seed.");
                return;
            }

            using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

            var exists = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM Users WHERE Role = @Role",
                new { Role = (int)UserRole.Admin });

            if (exists > 0)
            {
                _logger.LogInformation("Admin already exists. Skipping seed.");
                return;
            }

            var (hash, salt) = _hasher.Hash(password);

            await connection.ExecuteAsync("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, PasswordSalt,
                                   Role, RegisteredAtUtc, HasActiveRequestLimit,
                                   IsEmailVerified)
                VALUES (@Id, @Username, @Email, @PasswordHash, @PasswordSalt,
                        @Role, @RegisteredAtUtc, 0, 1)
                """,
                new
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    Email = email,
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    Role = (int)UserRole.Admin,
                    RegisteredAtUtc = DateTime.UtcNow
                });

            _logger.LogInformation("Admin user seeded: {Email}", email);
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
