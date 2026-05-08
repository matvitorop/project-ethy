using server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public record AdminAnalyticsPayload(AdminAnalyticsDto? Data, ErrorPayload? Error);
}
