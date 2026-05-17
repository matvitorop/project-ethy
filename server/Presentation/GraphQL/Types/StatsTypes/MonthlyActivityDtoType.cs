using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class MonthlyActivityDtoType : ObjectGraphType<MonthlyActivityDto>
    {
        public MonthlyActivityDtoType()
        {
            Field(x => x.Year);
            Field(x => x.Month);
            Field(x => x.Count);
        }
    }
}
