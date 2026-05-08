using MediatR;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics
{
    public class GetAdminAnalyticsHandler
    : IRequestHandler<GetAdminAnalyticsQuery, Result<AdminAnalyticsDto>>
    {
        private readonly IStatisticsRepository _repo;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "stats:admin-analytics";

        public GetAdminAnalyticsHandler(IStatisticsRepository repo, IMemoryCache cache)
        {
            _repo = repo;
            _cache = cache;
        }

        public async Task<Result<AdminAnalyticsDto>> Handle(
            GetAdminAnalyticsQuery request, CancellationToken ct)
        {
            if (_cache.TryGetValue(CacheKey, out AdminAnalyticsDto? cached))
                return Result<AdminAnalyticsDto>.Success(cached!);

            var data = await _repo.GetAdminAnalyticsAsync(ct);
            _cache.Set(CacheKey, data, TimeSpan.FromMinutes(5));
            return Result<AdminAnalyticsDto>.Success(data);
        }
    }
}
