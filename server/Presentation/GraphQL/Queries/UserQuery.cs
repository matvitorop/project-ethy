using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetUserStatistics;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.GetUserStatistic;

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
        }
    }

}
