using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.Notifications.GetNotifications;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.NotificationTypes;
using server.Presentation.GraphQL.Types.ErrorTypes;

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
                    return result.ToPayload((v, e) => new NotificationsPayload(v, e != null ? new ErrorPayload(e.Message, e.Code) : null));
                });
        }
    }

    public record NotificationsPayload(IReadOnlyList<NotificationDto>? Data, ErrorPayload? Error);

    public class NotificationsPayloadType : ObjectGraphType<NotificationsPayload>
    {
        public NotificationsPayloadType()
        {
            Field<ListGraphType<NotificationTypeGraphType>>("data")
                .Resolve(context => context.Source.Data);

            Field<ErrorPayloadType>("error")
                .Resolve(context => context.Source.Error);
        }
    }
}
