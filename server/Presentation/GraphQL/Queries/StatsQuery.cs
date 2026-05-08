using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity;
using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.StatsTypes;

namespace server.Presentation.GraphQL.Queries
{
    public class StatsQuery : ObjectGraphType
    {
        public StatsQuery(IMediator mediator)
        {
            Field<PlatformStatsPayloadType>("platformStats")
            .ResolveAsync(async ctx =>
            {
                var r = await mediator.Send(new GetPlatformStatsQuery());
                return r.ToPayload((val, err) => new PlatformStatsPayload(val, err));
            });

            Field<MonthlyActivityPayloadType>("monthlyActivity")
            .ResolveAsync(async ctx =>
            {
                var r = await mediator.Send(new GetMonthlyActivityQuery());
                return r.ToPayload((val, err) => new MonthlyActivityPayload(val, err));
            });

            Field<TopVolunteersPayloadType>("topVolunteers")
            .Argument<IntGraphType>("limit")
            .ResolveAsync(async ctx =>
            {
                var limit = ctx.GetArgument<int?>("limit") ?? 5;
                var r = await mediator.Send(new GetTopVolunteersQuery(limit));
                return r.ToPayload((val, err) => new TopVolunteersPayload(val, err));
            });
        }
    }
}
