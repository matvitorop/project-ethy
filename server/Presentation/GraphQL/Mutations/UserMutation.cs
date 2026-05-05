using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.UserHandlers.LeaveComplaint;
using server.Application.Handlers.UserHandlers.LeaveReview;
using server.Application.Handlers.UserHandlers.UpdateProfile;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.ComplaintTypes;
using server.Presentation.GraphQL.Types.ProfileTypes;
using server.Presentation.GraphQL.Types.ReviewTypes;

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
        }
    }

}
