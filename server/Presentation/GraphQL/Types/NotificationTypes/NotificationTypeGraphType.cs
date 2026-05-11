using GraphQL.Types;
using server.Application.Handlers.Notifications.GetNotifications;
using server.Domain.Notifications;

namespace server.Presentation.GraphQL.Types.NotificationTypes
{
    public class NotificationTypeGraphType : ObjectGraphType<NotificationDto>
    {
        public NotificationTypeGraphType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Title);
            Field(x => x.Content);
            Field(x => x.Type, type: typeof(NotificationCategoryEnumType));
            Field(x => x.IsRead);
            Field(x => x.CreatedAtUtc);
            Field(x => x.RelatedEntityId, nullable: true, type: typeof(IdGraphType));
            Field(x => x.RelatedEntityType, nullable: true);
        }
    }

    public class NotificationCategoryEnumType : EnumerationGraphType<NotificationType>
    {
        public NotificationCategoryEnumType()
        {
            Name = "NotificationCategoryEnum";
        }
    }
}
