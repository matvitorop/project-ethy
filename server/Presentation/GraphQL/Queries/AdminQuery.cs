using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.AdminHandlers.AdminGetHelpRequests;
using server.Application.Handlers.UserHandlers.GetBlockHistory;
using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.AdminTypes;

namespace server.Presentation.GraphQL.Queries
{
    public class AdminQuery : ObjectGraphType
    {
        public AdminQuery(IMediator mediator)
        {
            Field<AdminHelpRequestsPayloadType>("helpRequests")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<IntGraphType>("page")
            .Argument<IntGraphType>("pageSize")
            .Argument<BooleanGraphType>("isHidden")
            .Argument<BooleanGraphType>("isDeleted")
            .ResolveAsync(async ctx =>
            {
                var q = new AdminGetHelpRequestsQuery(
                    ctx.GetArgument<int?>("page") ?? 1,
                    ctx.GetArgument<int?>("pageSize") ?? 20,
                    ctx.GetArgument<bool?>("isHidden"),
                    ctx.GetArgument<bool?>("isDeleted"));
                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new AdminHelpRequestsPayload(val, err));
            });

            Field<ComplaintsPayloadType>("complaints")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<BooleanGraphType>("isResolved")
            .ResolveAsync(async ctx =>
            {
                var q = new GetComplaintsQuery(ctx.GetArgument<bool?>("isResolved"));
                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new ComplaintsPayload(val, err));
            });

            Field<VolunteerApplicationsPayloadType>("volunteerApplications")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<IntGraphType>("status")
            .ResolveAsync(async ctx =>
            {
                var q = new GetVolunteerApplicationsQuery(ctx.GetArgument<int?>("status"));
                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new VolunteerApplicationsPayload(val, err));
            });

            Field<BlockHistoryPayloadType>("blockHistory")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("userId")
            .ResolveAsync(async ctx =>
            {
                var q = new GetBlockHistoryQuery(ctx.GetArgument<Guid>("userId"));
                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new BlockHistoryPayload(val, err));
            });
        }
    }
}
