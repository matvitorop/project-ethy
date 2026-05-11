using GraphQL.Types;
using server.Application.Handlers.Notifications.GetNotifications;
using server.Domain.Notifications;

namespace server.Presentation.GraphQL.Types.NotificationTypes
{
    public class NotificationTypeGraphType : ObjectGraphType<NotificationDto>
    {
        public NotificationTypeGraphType()
        {
            Field<IdGraphType>("id").Resolve(context => context.Source.Id);
            Field(x => x.Title);
            Field(x => x.Content);
            Field<NotificationCategoryEnumType>("type").Resolve(context => context.Source.Type);
            Field(x => x.IsRead);
            Field(x => x.CreatedAtUtc);
            Field<IdGraphType>("relatedEntityId").Resolve(context => context.Source.RelatedEntityId);
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
