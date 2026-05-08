using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class PlatformStatsDtoType : ObjectGraphType<PlatformStatsDto>
    {
        public PlatformStatsDtoType()
        {
            Field(x => x.TotalRequests);
            Field(x => x.DraftRequests);
            Field(x => x.OpenRequests);
            Field(x => x.InProgressRequests);
            Field(x => x.ResolvedRequests);
            Field(x => x.CancelledRequests);
            Field(x => x.TotalUsers);
            Field(x => x.TotalVolunteers);
            Field(x => x.CompletionRate);
            Field(x => x.AvgCompletionDays);
        }
    }
}
