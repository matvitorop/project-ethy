using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.Notifications.GetNotifications
{
    public class GetNotificationsHandler : IRequestHandler<GetNotificationsQuery, Result<IReadOnlyList<NotificationDto>>>
    {
        private readonly INotificationRepository _repository;

        public GetNotificationsHandler(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<IReadOnlyList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken ct)
        {
            var notifications = await _repository.GetUserNotificationsAsync(request.UserId, request.Limit, ct);
            
            var dtos = notifications.Select(n => new NotificationDto(
                n.Id,
                n.Title,
                n.Content,
                n.Type,
                n.IsRead,
                n.CreatedAtUtc,
                n.RelatedEntityId,
                n.RelatedEntityType
            )).ToList();

            return Result<IReadOnlyList<NotificationDto>>.Success(dtos);
        }
    }
}
