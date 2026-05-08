using server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics;
using server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity;
using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;

namespace server.Application.IRepositories
{
    public interface IStatisticsRepository
    {
        Task<PlatformStatsDto> GetPlatformStatsAsync(CancellationToken ct);
        Task<List<MonthlyActivityDto>> GetMonthlyActivityAsync(CancellationToken ct);
        Task<TopVolunteersDto> GetTopVolunteersAsync(int limit, CancellationToken ct);
        Task<AdminAnalyticsDto> GetAdminAnalyticsAsync(CancellationToken ct);
    }
}
