using MediatR;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity
{
    public class GetMonthlyActivityHandler
        : IRequestHandler<GetMonthlyActivityQuery, Result<List<MonthlyActivityDto>>>
    {
        private readonly IStatisticsRepository _repo;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "stats:monthly";

        public GetMonthlyActivityHandler(IStatisticsRepository repo, IMemoryCache cache)
        {
            _repo = repo;
            _cache = cache;
        }

        public async Task<Result<List<MonthlyActivityDto>>> Handle(
            GetMonthlyActivityQuery request, CancellationToken ct)
        {
            if (_cache.TryGetValue(CacheKey, out List<MonthlyActivityDto>? cached))
                return Result<List<MonthlyActivityDto>>.Success(cached!);

            var data = await _repo.GetMonthlyActivityAsync(ct);

            _cache.Set(CacheKey, data, TimeSpan.FromMinutes(10));

            return Result<List<MonthlyActivityDto>>.Success(data);
        }
    }
}
