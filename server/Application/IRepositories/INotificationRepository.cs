using server.Domain.Notifications;

namespace server.Application.IRepositories
{
    public interface INotificationRepository
    {
        Task AddAsync(Notification notification, CancellationToken ct);
        Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(Guid userId, int limit, CancellationToken ct);
        Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct);
        Task MarkAsReadAsync(Guid notificationId, CancellationToken ct);
        Task MarkAllAsReadAsync(Guid userId, CancellationToken ct);
        Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct);
    }
}
