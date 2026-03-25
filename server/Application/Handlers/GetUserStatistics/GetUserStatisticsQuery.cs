using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetUserStatistics
{
    public sealed record GetUserStatisticsQuery(Guid userId) : IRequest<Result<UserStatisticsDto?>>;
}
