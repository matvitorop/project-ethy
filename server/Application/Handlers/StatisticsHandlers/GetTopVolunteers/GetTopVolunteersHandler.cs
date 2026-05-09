using MediatR;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetTopVolunteers
{
    public class GetTopVolunteersHandler
        : IRequestHandler<GetTopVolunteersQuery, Result<TopVolunteersDto>>
    {
        private readonly IStatisticsRepository _repo;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "stats:top-volunteers";

        public GetTopVolunteersHandler(IStatisticsRepository repo, IMemoryCache cache)
        {
            _repo = repo;
            _cache = cache;
        }

        public async Task<Result<TopVolunteersDto>> Handle(
            GetTopVolunteersQuery request, CancellationToken ct)
        {
            if (_cache.TryGetValue(CacheKey, out TopVolunteersDto? cached))
                return Result<TopVolunteersDto>.Success(cached!);

            var data = await _repo.GetTopVolunteersAsync(request.Limit, ct);

            _cache.Set(CacheKey, data, TimeSpan.FromMinutes(10));

            return Result<TopVolunteersDto>.Success(data);
        }
    }
}
