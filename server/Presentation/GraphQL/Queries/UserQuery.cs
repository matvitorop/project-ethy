using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetUserStatistics;
using server.Application.Handlers.UserHandlers.GetMyVolunteerApplication;
using server.Application.Handlers.UserHandlers.GetProfile;
using server.Application.Handlers.UserHandlers.GetPublicProfile;
using server.Application.Handlers.UserHandlers.GetUserReviews;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.GetUserStatistic;
using server.Presentation.GraphQL.Types.MyVolunteerApplication;
using server.Presentation.GraphQL.Types.ProfileTypes;
using server.Presentation.GraphQL.Types.PublicProfileTypes;
using server.Presentation.GraphQL.Types.ReviewTypes;

namespace server.Presentation.GraphQL.Queries
{
    public class UserQuery : ObjectGraphType
    {
        public UserQuery(IMediator mediator)
        {
            Field<GetUserStatisticsPayloadType>("GetUserStatisticQuery")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<GuidGraphType>> { Name = "userId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetUserStatisticsQuery(
                        context.GetArgument<Guid>("userId")
                    ));

                return result.ToPayload((value, error) => new GetUserStatisticPayload(value, error));
            });

            Field<ProfilePayloadType>("profile")
            .Authorize()
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var result = await mediator.Send(
                    new GetProfileQuery(userId));

                return result.ToPayload(
                    (value, error) => new ProfilePayload(value, error));
            });

            // Trust module
            Field<UserReviewsPayloadType>("getUserReviews")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "targetUserId" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetUserReviewsQuery(context.GetArgument<Guid>("targetUserId")));

                return result.ToPayload(
                    (value, error) => new UserReviewsPayload(value, error));
            });
            // ---

            Field<PublicProfilePayloadType>("getPublicProfile")
            .Argument<NonNullGraphType<IdGraphType>>("userId")
            .ResolveAsync(async ctx =>
            {
                var q = new GetPublicProfileQuery(ctx.GetArgument<Guid>("userId"));
                var result = await mediator.Send(q);
                return result.ToPayload((value, error) => new PublicProfilePayload(value, error));
            });

            Field<MyVolunteerApplicationPayloadType>("getMyVolunteerApplication")
            .Authorize()
            .ResolveAsync(async ctx =>
            {
                var userId = ctx.GetUserId();
                var r = await mediator.Send(new GetMyVolunteerApplicationQuery(userId));
                return r.ToPayload((val, err) => new MyVolunteerApplicationPayload(val, err));
            });

        }


    }

}
