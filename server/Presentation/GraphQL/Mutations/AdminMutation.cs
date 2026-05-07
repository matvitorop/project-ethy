using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.AdminHandlers.HideHelpRequest;
using server.Application.Handlers.UserHandlers.BlockUser;
using server.Application.Handlers.UserHandlers.ResolveComplaint;
using server.Application.Handlers.UserHandlers.ReviewVolunteerApplication;
using server.Application.Handlers.UserHandlers.UnblockUser;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.AdminTypes;
using System.Security.Claims;

namespace server.Presentation.GraphQL.Mutations
{
    public class AdminMutation : ObjectGraphType
    {
        public AdminMutation(IMediator mediator)
        {
            // --- Блокування ---
            Field<AdminActionPayloadType>("blockUser")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("targetUserId")
            .Argument<NonNullGraphType<StringGraphType>>("reason")
            .Argument<DateTimeGraphType>("blockedUntilUtc")
            .ResolveAsync(async ctx =>
            {
                var adminId = ctx.GetUserId();
                var r = await mediator.Send(new BlockUserCommand(
                    adminId,
                    ctx.GetArgument<Guid>("targetUserId"),
                    ctx.GetArgument<string>("reason"),
                    ctx.GetArgument<DateTime?>("blockedUntilUtc")));
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            Field<AdminActionPayloadType>("unblockUser")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("targetUserId")
            .ResolveAsync(async ctx =>
            {
                var r = await mediator.Send(
                    new UnblockUserCommand(ctx.GetArgument<Guid>("targetUserId")));
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            Field<AdminActionPayloadType>("hideHelpRequest")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("helpRequestId")
            .Argument<NonNullGraphType<BooleanGraphType>>("hide")
            .ResolveAsync(async ctx =>
            {
                var r = await mediator.Send(new HideHelpRequestCommand(
                    ctx.GetArgument<Guid>("helpRequestId"),
                    ctx.GetArgument<bool>("hide")));
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            Field<AdminActionPayloadType>("resolveComplaint")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("complaintId")
            .Argument<StringGraphType>("adminComment")
            .ResolveAsync(async ctx =>
            {
                var cmd = new ResolveComplaintCommand(
                    ctx.GetArgument<Guid>("complaintId"),
                    ctx.GetArgument<string?>("adminComment"));
                var r = await mediator.Send(cmd);
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            Field<AdminActionPayloadType>("reviewVolunteerApplication")
            .Authorize().AuthorizeWithRoles("Admin")
            .Argument<NonNullGraphType<IdGraphType>>("applicationId")
            .Argument<NonNullGraphType<BooleanGraphType>>("approve")
            .Argument<StringGraphType>("comment")
            .ResolveAsync(async ctx =>
            {
                var adminId = ctx.GetUserId();
                var r = await mediator.Send(new ReviewVolunteerApplicationCommand(
                    adminId,
                    ctx.GetArgument<Guid>("applicationId"),
                    ctx.GetArgument<bool>("approve"),
                    ctx.GetArgument<string?>("comment")));
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });
        }
    }
}
