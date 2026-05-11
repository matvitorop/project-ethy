using Dapper;
using server.Application.IRepositories;
using server.Domain.Notifications;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public NotificationRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(Notification notification, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = """
                INSERT INTO Notifications (
                    Id, UserId, Title, Content, Type, IsRead, CreatedAtUtc, RelatedEntityId, RelatedEntityType
                ) VALUES (
                    @Id, @UserId, @Title, @Content, @Type, @IsRead, @CreatedAtUtc, @RelatedEntityId, @RelatedEntityType
                )
            """;
            await connection.ExecuteAsync(sql, notification);
        }

        public async Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(Guid userId, int limit, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = """
                SELECT TOP (@Limit) *
                FROM Notifications
                WHERE UserId = @UserId
                ORDER BY CreatedAtUtc DESC
            """;
            var notifications = await connection.QueryAsync<Notification>(sql, new { UserId = userId, Limit = limit });
            return notifications.ToList();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = "SELECT COUNT(*) FROM Notifications WHERE UserId = @UserId AND IsRead = 0";
            return await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
        }

        public async Task MarkAsReadAsync(Guid notificationId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = "UPDATE Notifications SET IsRead = 1 WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = notificationId });
        }

        public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = "UPDATE Notifications SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0";
            await connection.ExecuteAsync(sql, new { UserId = userId });
        }

        public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            const string sql = "SELECT * FROM Notifications WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Notification>(sql, new { Id = id });
        }
    }
}
