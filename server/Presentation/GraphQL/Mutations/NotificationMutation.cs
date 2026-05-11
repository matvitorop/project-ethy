using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.Notifications.MarkAsRead;
using server.Presentation.GraphQL.Extensions;

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
                    return new MarkReadPayload(result.IsSuccess, result.Error);
                });

            Field<MarkReadPayloadType>("markAllAsRead")
                .Authorize()
                .ResolveAsync(async context =>
                {
                    var result = await mediator.Send(new MarkAllAsReadCommand(context.GetUserId()));
                    return new MarkReadPayload(result.IsSuccess, result.Error);
                });
        }
    }

    public record MarkReadPayload(bool Success, server.Domain.Primitives.Error? Error);

    public class MarkReadPayloadType : ObjectGraphType<MarkReadPayload>
    {
        public MarkReadPayloadType()
        {
            Field(x => x.Success);
            Field(x => x.Error, nullable: true, type: typeof(server.Presentation.GraphQL.Types.ErrorTypes.ErrorType));
        }
    }
}
