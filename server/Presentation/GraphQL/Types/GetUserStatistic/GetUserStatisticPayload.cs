using server.Application.Handlers.GetUserStatistics;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetUserStatistic
{
    public sealed record GetUserStatisticPayload(
        UserStatisticsDto? Data,
        ErrorPayload? Error
        );
    
}
