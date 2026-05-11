using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.Notifications.MarkAsRead;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Mutations
{
    public class NotificationMutation : ObjectGraphType
    {
        public NotificationMutation(IMediator mediator)
        {
            Field<MarkReadPayloadType>("markAsRead")
                .Authorize()
                .Arguments(new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "id" })
                .ResolveAsync(async context =>
                {
                    var result = await mediator.Send(new MarkAsReadCommand(context.GetArgument<Guid>("id"), context.GetUserId()));
                    return new MarkReadPayload(result.IsSuccess, result.Error != null ? new ErrorPayload(result.Error.Message, result.Error.Code) : null);
                });

            Field<MarkReadPayloadType>("markAllAsRead")
                .Authorize()
                .ResolveAsync(async context =>
                {
                    var result = await mediator.Send(new MarkAllAsReadCommand(context.GetUserId()));
                    return new MarkReadPayload(result.IsSuccess, result.Error != null ? new ErrorPayload(result.Error.Message, result.Error.Code) : null);
                });
        }
    }

    public record MarkReadPayload(bool Success, ErrorPayload? Error);

    public class MarkReadPayloadType : ObjectGraphType<MarkReadPayload>
    {
        public MarkReadPayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(context => context.Source.Error);
        }
    }
}
