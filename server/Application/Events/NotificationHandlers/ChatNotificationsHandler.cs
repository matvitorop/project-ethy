using MediatR;
using server.Application.IServices;
using server.Domain.Notifications;

namespace server.Application.Events.NotificationHandlers
{
    public class ChatNotificationsHandler : INotificationHandler<ChatMessageSentEvent>
    {
        private readonly INotificationService _notificationService;

        public ChatNotificationsHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(ChatMessageSentEvent notification, CancellationToken ct)
        {
            await _notificationService.SendNotificationAsync(
                notification.ReceiverId,
                $"Нове повідомлення від {notification.SenderUsername}",
                notification.Content.Length > 50 ? notification.Content.Substring(0, 47) + "..." : notification.Content,
                NotificationType.Chat,
                notification.ChatId,
                "Chat",
                ct);
        }
    }
}
