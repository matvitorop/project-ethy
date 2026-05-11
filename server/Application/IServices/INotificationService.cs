using server.Domain.Notifications;

namespace server.Application.IServices
{
    public interface INotificationService
    {
        /// <summary>
        /// Creates a notification in DB and sends real-time signal via SignalR
        /// </summary>
        Task SendNotificationAsync(
            Guid userId, 
            string title, 
            string content, 
            NotificationType type, 
            Guid? relatedEntityId = null, 
            string? relatedEntityType = null,
            CancellationToken ct = default);
    }
}
