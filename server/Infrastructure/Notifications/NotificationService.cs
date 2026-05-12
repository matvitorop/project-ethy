using Microsoft.AspNetCore.SignalR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Notifications;
using server.Presentation.Hubs;

namespace server.Infrastructure.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(
            INotificationRepository repository, 
            IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(
            Guid userId, 
            string title, 
            string content, 
            NotificationType type, 
            Guid? relatedEntityId = null, 
            string? relatedEntityType = null, 
            CancellationToken ct = default)
        {
            // 1. Create and Save Notification Entity
            var notification = new Notification(
                userId, 
                title, 
                content, 
                type, 
                relatedEntityId, 
                relatedEntityType);

            await _repository.AddAsync(notification, ct);

            // 2. Push real-time via SignalR
            // SignalR allows sending to specific users by their ID if authenticated
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                id = notification.Id,
                title = notification.Title,
                content = notification.Content,
                type = (int)notification.Type,
                createdAtUtc = notification.CreatedAtUtc,
                isRead = notification.IsRead,
                relatedEntityId = notification.RelatedEntityId,
                relatedEntityType = notification.RelatedEntityType
            }, ct);
        }
    }
}
