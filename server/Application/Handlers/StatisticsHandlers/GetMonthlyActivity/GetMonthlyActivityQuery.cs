using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity
{
    public record GetMonthlyActivityQuery : IRequest<Result<List<MonthlyActivityDto>>>;
}
