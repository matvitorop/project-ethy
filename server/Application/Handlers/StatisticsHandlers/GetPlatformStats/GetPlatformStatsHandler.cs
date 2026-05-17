using MediatR;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetPlatformStats
{
    public class GetPlatformStatsHandler
        : IRequestHandler<GetPlatformStatsQuery, Result<PlatformStatsDto>>
    {
        private readonly IStatisticsRepository _repo;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "stats:platform";

        public GetPlatformStatsHandler(IStatisticsRepository repo, IMemoryCache cache)
        {
            _repo = repo;
            _cache = cache;
        }

        public async Task<Result<PlatformStatsDto>> Handle(
            GetPlatformStatsQuery request, CancellationToken ct)
        {
            if (_cache.TryGetValue(CacheKey, out PlatformStatsDto? cached))
                return Result<PlatformStatsDto>.Success(cached!);

            var stats = await _repo.GetPlatformStatsAsync(ct);

            _cache.Set(CacheKey, stats, TimeSpan.FromMinutes(10));

            return Result<PlatformStatsDto>.Success(stats);
        }
    }
}
