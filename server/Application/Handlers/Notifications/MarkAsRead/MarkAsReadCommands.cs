using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.Notifications.MarkAsRead
{
    public sealed record MarkAsReadCommand(Guid NotificationId, Guid UserId) : IRequest<Result>;
    public sealed record MarkAllAsReadCommand(Guid UserId) : IRequest<Result>;
}
