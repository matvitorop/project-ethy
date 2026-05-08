using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public record PlatformStatsPayload(PlatformStatsDto? Stats, ErrorPayload? Error);
}
