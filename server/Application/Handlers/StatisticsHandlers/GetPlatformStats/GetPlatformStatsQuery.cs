using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetPlatformStats
{
    public record GetPlatformStatsQuery : IRequest<Result<PlatformStatsDto>>;
}
