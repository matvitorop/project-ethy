using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetChatMessages;
using server.Application.Handlers.GetEventLog;
using server.Application.Handlers.GetFullHelpRequest;
using server.Application.Handlers.GetHelpRequestResponses;
using server.Application.Handlers.GetMyChats;
using server.Application.Handlers.GetStages;
using server.Application.Handlers.HelpRequestResponseHandlers.GetReports;
using server.Domain.HelpRequest;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types;
using server.Presentation.GraphQL.Types.ChangeHRStatusTypes;
using server.Presentation.GraphQL.Types.ChatMessagesTypes;
using server.Presentation.GraphQL.Types.ChatTypes;
using server.Presentation.GraphQL.Types.ErrorTypes;
using server.Presentation.GraphQL.Types.GetHRDetailTypes;
using server.Presentation.GraphQL.Types.GetHRListTypes;
using server.Presentation.GraphQL.Types.GetHRResponsesTypes;
using server.Presentation.GraphQL.Types.ReportTypes;
using server.Presentation.GraphQL.Types.StageLogTypes;
using server.Presentation.GraphQL.Types.StageTypes;

namespace server.Presentation.GraphQL.Queries
{
    public class HelpRequestQuery : ObjectGraphType
    {
        public HelpRequestQuery(IMediator mediator)
        {
            Field<HelpRequestsPagePayloadType>("helpRequestQuery")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IntGraphType>> { Name = "page" },
                new QueryArgument<NonNullGraphType<IntGraphType>> { Name = "pageSize" },
                new QueryArgument<HelpRequestStatusEnumType> { Name = "status" },
                new QueryArgument<ListGraphType<HelpRequestStatusEnumType>> { Name = "statuses" },
                new QueryArgument<IdGraphType> { Name = "creatorId" },  
                new QueryArgument<IdGraphType> { Name = "assignedUserId" },
                new QueryArgument<BooleanGraphType> { Name = "hasNoReport" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetHelpRequestsPageQuery(
                        context.GetArgument<int>("page"),
                        context.GetArgument<int>("pageSize"),
                        context.GetArgument<HelpRequestStatus?>("status"),
                        context.GetArgument<List<HelpRequestStatus>?>("statuses"),
                        context.GetArgument<Guid?>("creatorId"),      
                        context.GetArgument<Guid?>("assignedUserId"),
                        context.GetArgument<bool?>("hasNoReport")
                    ));

                return result.ToPayload((value, error) =>
                    new HelpRequestsPagePayload(value, error));
            });

            Field<HelpRequestDetailPeyloadType>("helpRequestById")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "id" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetFullHelpRequestQuery(
                        context.GetArgument<Guid>("id")
                    )
                );

                return result.ToPayload((value, error) => new HelpRequestDetailPayload(value, error));
            });

            Field<HelpRequestResponsesPayloadType>("helpRequestResponses")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetHelpRequestResponsesQuery(
                        context.GetArgument<Guid>("helpRequestId"),
                        context.GetUserId()
                    ));

                return result.ToPayload(
                    (value, error) => new HelpRequestResponsesPayload(value, error));
            });

            // If will more than 1 endpoint related to chat messages, consider to move it to separate query type
            Field<ChatMessagesPayloadType>("chatMessages")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new GetChatMessagesQuery(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId));

                return result.ToPayload(
                    (value, error) => new ChatMessagesPayload(value, error));
            });

            Field<StagesPayloadType>("stages")
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetStagesQuery(
                        context.GetArgument<Guid>("helpRequestId")));

                return result.ToPayload(
                    (value, error) => new StagesPayload(value, error));
            });

            Field<EventLogPayloadType>("eventLog")
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetEventLogQuery(
                        context.GetArgument<Guid>("helpRequestId")));
            
                return result.ToPayload(
                    (value, error) => new EventLogPayload(value, error));
            });

            Field<ReportsPayloadType>("reports")
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetReportsQuery(
                        context.GetArgument<Guid>("helpRequestId")));

                return result.ToPayload(
                    (value, error) => new ReportsPayload(value, error));
            });

            Field<MyChatsPayloadType>("myChats")
            .Authorize()
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new GetMyChatsQuery(userId));

                return result.ToPayload(
                    (value, error) => new MyChatsPayload(value, error));
            });
        }
    }
}
