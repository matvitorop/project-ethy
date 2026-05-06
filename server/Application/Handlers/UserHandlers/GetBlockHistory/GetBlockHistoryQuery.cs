using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetBlockHistory
{
    public record GetBlockHistoryQuery(Guid UserId) : IRequest<Result<List<BlockHistoryDto>>>;
}
