using server.Application.Handlers.StatisticsHandlers.GetPlatformStats;

namespace server.Application.IRepositories
{
    public interface IStatisticsRepository
    {
        Task<PlatformStatsDto> GetPlatformStatsAsync(CancellationToken ct);
        Task<List<MonthlyActivityDto>> GetMonthlyActivityAsync(CancellationToken ct);
        Task<TopVolunteersDto> GetTopVolunteersAsync(int limit, CancellationToken ct);
    }
}
