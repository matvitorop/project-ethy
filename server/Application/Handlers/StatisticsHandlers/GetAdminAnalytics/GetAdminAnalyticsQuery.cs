using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics
{
    public record GetAdminAnalyticsQuery : IRequest<Result<AdminAnalyticsDto>>;
}
