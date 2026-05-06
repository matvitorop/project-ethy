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
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<AdminSeeder> _logger;

        public AdminSeeder(
            IServiceScopeFactory scopeFactory,
            IConfiguration config,
            ILogger<AdminSeeder> logger)
        {
            _scopeFactory = scopeFactory;
            _config = config;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var email = _config["AdminSeed:Email"];
            var password = _config["AdminSeed:Password"];

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("AdminSeed credentials not configured. Skipping.");
                return;
            }

            using var scope = _scopeFactory.CreateScope();
            var connectionFactory = scope.ServiceProvider
                .GetRequiredService<ISqlConnectionFactory>();
            var hasher = scope.ServiceProvider
                .GetRequiredService<IPasswordHasher>();

            using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

            var exists = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM Users WHERE Role = @Role",
                new { Role = (int)UserRole.Admin });

            if (exists > 0)
            {
                _logger.LogInformation("Admin already exists. Skipping seed.");
                return;
            }

            var (hash, salt) = hasher.Hash(password);

            await connection.ExecuteAsync("""
            INSERT INTO Users (Id, Username, Email, PasswordHash, PasswordSalt,
                               Role, RegisteredAtUtc, HasActiveRequestLimit, IsEmailVerified)
            VALUES (@Id, 'admin', @Email, @Hash, @Salt, 0, @Now, 0, 1)
            """,
                new
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    Hash = hash,
                    Salt = salt,
                    Now = DateTime.UtcNow
                });

            _logger.LogInformation("Admin seeded: {Email}", email);
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
