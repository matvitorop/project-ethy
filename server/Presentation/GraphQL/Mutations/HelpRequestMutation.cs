using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.AddHelpRequest;
using server.Application.Handlers.AssignExecutor;
using server.Application.Handlers.CancelHelpRequest;
using server.Application.Handlers.ChangeHelpRequestStatus;
using server.Application.Handlers.EditHelpRequest;
using server.Application.Handlers.HelpRequestResponseHandlers.CancelResponse;
using server.Application.Handlers.HelpRequestResponseHandlers.ResignAsExecutor;
using server.Application.Handlers.ResponseToHelpRequestHandler;
using server.Application.Handlers.RestoreHelpRequest;
using server.Application.Handlers.SoftDeleteHelpRequest;
using server.Domain.HelpRequest;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.AddHelpRequestTypes;
using server.Presentation.GraphQL.Types.AssignExecutorTypes;
using server.Presentation.GraphQL.Types.CancelHelpRequestTypes;
using server.Presentation.GraphQL.Types.CancelResponseTypes;
using server.Presentation.GraphQL.Types.ChangeHRStatusTypes;
using server.Presentation.GraphQL.Types.EditHelpRequestTypes;
using server.Presentation.GraphQL.Types.ResignAsExecutorTypes;
using server.Presentation.GraphQL.Types.ResponseToHRTypes;
using server.Presentation.GraphQL.Types.RestoreHelpRequestTypes;
using server.Presentation.GraphQL.Types.SoftDeleteHelpRequestTypes;

namespace server.Presentation.GraphQL.Mutations
{
    public class HelpRequestMutation : ObjectGraphType
    {
        public HelpRequestMutation(IMediator mediator)
        {
            Field<AddHelpRequestPayloadType>("createHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "title" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "description" },
                    new QueryArgument<FloatGraphType> { Name = "latitude" },
                    new QueryArgument<FloatGraphType> { Name = "longitude" },
                    new QueryArgument<ListGraphType<StringGraphType>> { Name = "imageUrls" }
                )
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var command = new AddHelpRequestCommand(
                    CreatorId: userId,
                    Title: context.GetArgument<string>("title"),
                    Description: context.GetArgument<string>("description"),
                    Latitude: context.GetArgument<double?>("latitude"),
                    Longitude: context.GetArgument<double?>("longitude"),
                    ImageUrls: context.GetArgument<List<string>>("imageUrls") ?? []
                );

                var result = await mediator.Send(command);

                return result.ToPayload((value, error) => new AddHelpRequestPayload(value, error));
            });

            Field<ChangeHelpRequestStatusPayloadType>("changeHelpRequestStatus")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>>
                {
                    Name = "helpRequestId"
                },
                new QueryArgument<NonNullGraphType<HelpRequestStatusEnumType>>
                {
                    Name = "status"
                }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var helpRequestId =
                    context.GetArgument<Guid>("helpRequestId");

                var status =
                    context.GetArgument<HelpRequestStatus>("status");

                var result = await mediator.Send(
                    new ChangeHelpRequestStatusCommand(
                        helpRequestId,
                        status,
                        userId));

                return result.ToPayload((value, error) => new ChangeHelpRequestStatusPayload(value, error));
            });

            Field<ResponseToHelpRequestPayloadType>("respondToHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "message" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new ResponseToHelpRequestCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId,
                        context.GetArgument<string>("message")
                    ));

                return result.ToPayload(
                    (value, error) => new ResponseToHelpRequestPayload(value, error));
            });

            Field<AssignExecutorPayloadType>("assignExecutor")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "responseId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new AssignExecutorCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        context.GetArgument<Guid>("responseId"),
                        context.GetUserId()
                    ));

                return result.ToPayload(
                    (value, error) => new AssignExecutorPayload(value, error));
            });

            Field<EditHelpRequestPayloadType>("editHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "title" },
                new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "description" },
                new QueryArgument<FloatGraphType> { Name = "latitude" },
                new QueryArgument<FloatGraphType> { Name = "longitude" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new EditHelpRequestCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId,
                        context.GetArgument<string>("title"),
                        context.GetArgument<string>("description"),
                        context.GetArgument<double?>("latitude"),
                        context.GetArgument<double?>("longitude")
                    ));

                return result.ToPayload(
                    error => new EditHelpRequestPayload(error == null, error));
            });

            Field<SoftDeleteHelpRequestPayloadType>("softDeleteHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new SoftDeleteHelpRequestCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId));

                return result.ToPayload(
                    error => new SoftDeleteHelpRequestPayload(error == null, error));
            });

            Field<CancelHelpRequestPayloadType>("cancelHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "reason" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();
            
                var result = await mediator.Send(
                    new CancelHelpRequestCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId,
                        context.GetArgument<string>("reason")));
            
                return result.ToPayload(
                    error => new CancelHelpRequestPayload(error == null, error));
            });

            Field<RestoreHelpRequestPayloadType>("restoreHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new RestoreHelpRequestCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId));

                return result.ToPayload(
                    error => new RestoreHelpRequestPayload(error == null, error));
            });

            Field<CancelResponsePayloadType>("cancelResponse")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new CancelResponseCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId));

                return result.ToPayload(
                    error => new CancelResponsePayload(error == null, error));
            });

            Field<ResignAsExecutorPayloadType>("resignAsExecutor")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "reason" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new ResignAsExecutorCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId,
                        context.GetArgument<string>("reason")));

                return result.ToPayload(
                    error => new ResignAsExecutorPayload(error == null, error));
            });









        }
    }
}
