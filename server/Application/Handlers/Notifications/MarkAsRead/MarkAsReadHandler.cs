using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.Notifications.MarkAsRead
{
    public class MarkAsReadHandler : 
        IRequestHandler<MarkAsReadCommand, Result>,
        IRequestHandler<MarkAllAsReadCommand, Result>
    {
        private readonly INotificationRepository _repository;

        public MarkAsReadHandler(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(MarkAsReadCommand request, CancellationToken ct)
        {
            var notification = await _repository.GetByIdAsync(request.NotificationId, ct);
            if (notification == null)
                return Result.Failure(new Error("Notification not found", "Notification.NOT_FOUND"));

            if (notification.UserId != request.UserId)
                return Result.Failure(new Error("Forbidden", "Notification.FORBIDDEN"));

            await _repository.MarkAsReadAsync(request.NotificationId, ct);
            return Result.Success();
        }

        public async Task<Result> Handle(MarkAllAsReadCommand request, CancellationToken ct)
        {
            await _repository.MarkAllAsReadAsync(request.UserId, ct);
            return Result.Success();
        }
    }
}
