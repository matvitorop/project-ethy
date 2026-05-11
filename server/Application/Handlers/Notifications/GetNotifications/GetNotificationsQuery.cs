using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.Notifications.GetNotifications
{
    public sealed record GetNotificationsQuery(Guid UserId, int Limit = 20) : IRequest<Result<IReadOnlyList<NotificationDto>>>;
}
