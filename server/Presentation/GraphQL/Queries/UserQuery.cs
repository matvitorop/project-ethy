using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetUserStatistics;
using server.Application.Handlers.User.GetProfile;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.GetUserStatistic;
using server.Presentation.GraphQL.Types.ProfileTypes;

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
        }


    }

}
