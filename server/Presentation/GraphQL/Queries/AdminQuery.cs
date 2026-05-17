using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.AdminHandlers.AdminGetUsers;
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
            .Argument<AdminHelpRequestFilterInputType>("filter")
            .ResolveAsync(async ctx =>
            {
                var f = ctx.GetArgument<Dictionary<string, object>>("filter") ?? new();
                
                int page = f.ContainsKey("page") ? (int)f["page"] : 1;
                int pageSize = f.ContainsKey("pageSize") ? (int)f["pageSize"] : 20;
                bool? isHidden = f.ContainsKey("isHidden") ? (bool?)f["isHidden"] : null;
                bool? isDeleted = f.ContainsKey("isDeleted") ? (bool?)f["isDeleted"] : null;
                List<int>? statuses = f.ContainsKey("statuses") 
                    ? ((IEnumerable<object>)f["statuses"]).Select(Convert.ToInt32).ToList() 
                    : null;
                string? searchTerm = f.ContainsKey("searchTerm") ? (string?)f["searchTerm"] : null;

                var q = new AdminGetHelpRequestsQuery(page, pageSize, isHidden, isDeleted, statuses, searchTerm);

                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new AdminHelpRequestsPayload(val, err));
            });

            Field<AdminUsersPayloadType>("users")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<IntGraphType>("page")
            .Argument<IntGraphType>("pageSize")
            .Argument<StringGraphType>("searchTerm")
            .Argument<StringGraphType>("shortId")
            .ResolveAsync(async ctx =>
            {
                var page = ctx.GetArgument<int>("page", 1);
                var pageSize = ctx.GetArgument<int>("pageSize", 20);
                var searchTerm = ctx.GetArgument<string?>("searchTerm");
                var shortId = ctx.GetArgument<string?>("shortId");

                var q = new AdminGetUsersQuery(page, pageSize, searchTerm, shortId);
                var result = await mediator.Send(q);
                return result.ToPayload((val, err) => new AdminUsersPayload(val, err));
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
