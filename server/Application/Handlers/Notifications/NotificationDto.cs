using server.Domain.Notifications;

namespace server.Application.Handlers.Notifications.GetNotifications
{
    public sealed record NotificationDto(
        Guid Id,
        string Title,
        string Content,
        NotificationType Type,
        bool IsRead,
        DateTime CreatedAtUtc,
        Guid? RelatedEntityId,
        string? RelatedEntityType);
}
