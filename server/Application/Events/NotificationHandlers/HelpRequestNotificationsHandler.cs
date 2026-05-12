using MediatR;
using server.Application.IServices;
using server.Domain.HelpRequest;
using server.Domain.Notifications;

namespace server.Application.Events.NotificationHandlers
{
    public class HelpRequestNotificationsHandler : 
        INotificationHandler<HelpRequestRespondedEvent>,
        INotificationHandler<HelpRequestAssignedEvent>,
        INotificationHandler<HelpRequestStatusChangedEvent>
    {
        private readonly INotificationService _notificationService;

        public HelpRequestNotificationsHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(HelpRequestRespondedEvent notification, CancellationToken ct)
        {
            await _notificationService.SendNotificationAsync(
                notification.CreatorId,
                "Новий відгук!",
                $"Хтось запропонував вам допомогу у заявці. Перегляньте деталі.",
                NotificationType.HelpRequest,
                notification.HelpRequestId,
                "HelpRequest",
                ct);
        }

        public async Task Handle(HelpRequestAssignedEvent notification, CancellationToken ct)
        {
            await _notificationService.SendNotificationAsync(
                notification.ExecutorId,
                "Вас обрано виконавцем!",
                $"Вас призначено на виконання заявки: \"{notification.HelpRequestTitle}\". Ви можете розпочати чат з автором.",
                NotificationType.HelpRequest,
                notification.HelpRequestId,
                "HelpRequest",
                ct);
        }

        public async Task Handle(HelpRequestStatusChangedEvent notification, CancellationToken ct)
        {
            if (notification.ParticipantId == null) return;

            string title = "Статус заявки змінено";
            string content = $"Статус вашої заявки \"{notification.HelpRequestTitle}\" тепер: {notification.NewStatus}.";

            if (notification.NewStatus == HelpRequestStatus.Resolved)
            {
                title = "Заявку виконано!";
                content = $"Вітаємо! Заявку \"{notification.HelpRequestTitle}\" було успішно завершено. Дякуємо за вашу допомогу!";
            }
            else if (notification.NewStatus == HelpRequestStatus.Cancelled)
            {
                title = "Заявку скасовано";
                content = $"Заявку \"{notification.HelpRequestTitle}\" було скасовано.";
            }

            await _notificationService.SendNotificationAsync(
                notification.ParticipantId.Value,
                title,
                content,
                NotificationType.HelpRequest,
                notification.HelpRequestId,
                "HelpRequest",
                ct);
        }
    }
}
