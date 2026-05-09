using server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public record MonthlyActivityPayload(List<MonthlyActivityDto>? Items, ErrorPayload? Error);

}
