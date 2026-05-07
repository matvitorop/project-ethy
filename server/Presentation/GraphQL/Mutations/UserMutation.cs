using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.UserHandlers.LeaveComplaint;
using server.Application.Handlers.UserHandlers.LeaveReview;
using server.Application.Handlers.UserHandlers.ResendVerificationByEmail;
using server.Application.Handlers.UserHandlers.SendVerificationEmail;
using server.Application.Handlers.UserHandlers.SubmitVolunteerApplication;
using server.Application.Handlers.UserHandlers.UpdateProfile;
using server.Application.Handlers.UserHandlers.VerifyEmail;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.AdminTypes;
using server.Presentation.GraphQL.Types.ComplaintTypes;
using server.Presentation.GraphQL.Types.ProfileTypes;
using server.Presentation.GraphQL.Types.ReviewTypes;
using server.Presentation.GraphQL.Types.SubmitVolunteerApplicationTypes;

namespace server.Presentation.GraphQL.Mutations
{
    public class UserMutation : ObjectGraphType
    {
        public UserMutation(IMediator mediator)
        {
            Field<LeaveReviewPayloadType>("leaveReview")
            .Authorize()
            .Arguments(
                new QueryArguments(
                    new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "helpRequestId" },
                    new QueryArgument<NonNullGraphType<BooleanGraphType>> { Name = "isPositive" },
                    new QueryArgument<StringGraphType> { Name = "comment" }
                )
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new LeaveReviewCommand(
                        context.GetArgument<Guid>("helpRequestId"),
                        userId,
                        context.GetArgument<bool>("isPositive"),
                        context.GetArgument<string?>("comment")));

                return result.ToPayload(
                    (value, error) => new LeaveReviewPayload(value, error));
            });

            Field<LeaveComplaintPayloadType>("leaveComplaint")
            .Authorize()
            .Arguments(
                new QueryArguments(
                    new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "targetUserId" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "reason" }
                )
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new LeaveComplaintCommand(
                        userId,
                        context.GetArgument<Guid>("targetUserId"),
                        context.GetArgument<string>("reason")));

                return result.ToPayload(
                    (value, error) => new LeaveComplaintPayload(value, error));
            });

            Field<UpdateProfilePayloadType>("updateProfile")
            .Authorize()
            .Arguments(
                new QueryArguments(
                    new QueryArgument<StringGraphType> { Name = "phoneNumber" },
                    new QueryArgument<StringGraphType> { Name = "socialLinks" }
                )
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new UpdateProfileCommand(
                        userId,
                        context.GetArgument<string?>("phoneNumber"),
                        context.GetArgument<string?>("socialLinks")));

                return result.ToPayload(
                    error => new UpdateProfilePayload(error == null, error));
            });

            Field<BooleanGraphType>("sendVerificationEmail")
            .Authorize()
            .ResolveAsync(async ctx =>
            {
                var userId = ctx.GetUserId();
                var cmd = new SendVerificationEmailCommand(userId);
                var r = await mediator.Send(cmd);
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            Field<AdminActionPayloadType>("verifyEmail")
            .Argument<NonNullGraphType<StringGraphType>>("token")
            .ResolveAsync(async ctx =>
            {
                var cmd = new VerifyEmailCommand(ctx.GetArgument<string>("token"));
                var r = await mediator.Send(cmd);
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

            // +++ Admin module: Volunteer application
            Field<IdGraphType>("submitVolunteerApplication")
            .Authorize()
            .Argument<NonNullGraphType<StringGraphType>>("organizationName")
            .Argument<NonNullGraphType<StringGraphType>>("activityDescription")
            .Argument<StringGraphType>("documentImageUrl")
            .ResolveAsync(async ctx =>
            {
                var userId = ctx.GetUserId();
                var cmd = new SubmitVolunteerApplicationCommand(
                    userId,
                    ctx.GetArgument<string>("organizationName"),
                    ctx.GetArgument<string>("activityDescription"),
                    ctx.GetArgument<string?>("documentImageUrl"));
                var r = await mediator.Send(cmd);
                return r.ToPayload((val, err) => new SubmitVolunteerApplicationPayload(val, err));
            });

            Field<AdminActionPayloadType>("resendVerificationEmail")
            .Argument<NonNullGraphType<StringGraphType>>("email")
            .ResolveAsync(async ctx =>
            {
                var r = await mediator.Send(new ResendVerificationByEmailCommand(
                    ctx.GetArgument<string>("email")));
                return r.ToPayload((val, err) => new AdminActionPayload(val, err));
            });

        }

    }

}
