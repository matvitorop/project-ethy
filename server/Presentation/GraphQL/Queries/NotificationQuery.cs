using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.Notifications.GetNotifications;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.NotificationTypes;

namespace server.Presentation.GraphQL.Queries
{
    public class NotificationQuery : ObjectGraphType
    {
        public NotificationQuery(IMediator mediator)
        {
            Field<NotificationsPayloadType>("notifications")
                .Authorize()
                .Arguments(new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 })
                .ResolveAsync(async context =>
                {
                    var userId = context.GetUserId();
                    var result = await mediator.Send(new GetNotificationsQuery(userId, context.GetArgument<int>("limit")));
                    return result.ToPayload((v, e) => new NotificationsPayload(v, e));
                });
        }
    }

    public record NotificationsPayload(IReadOnlyList<NotificationDto>? Data, server.Domain.Primitives.Error? Error);

    public class NotificationsPayloadType : ObjectGraphType<NotificationsPayload>
    {
        public NotificationsPayloadType()
        {
            Field(x => x.Data, nullable: true, type: typeof(ListGraphType<NotificationTypeGraphType>));
            Field(x => x.Error, nullable: true, type: typeof(server.Presentation.GraphQL.Types.ErrorTypes.ErrorType));
        }
    }
}
