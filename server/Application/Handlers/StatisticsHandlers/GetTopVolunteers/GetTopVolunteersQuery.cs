using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.StatisticsHandlers.GetTopVolunteers
{
    public record GetTopVolunteersQuery(int Limit = 5)
        : IRequest<Result<TopVolunteersDto>>;

}
