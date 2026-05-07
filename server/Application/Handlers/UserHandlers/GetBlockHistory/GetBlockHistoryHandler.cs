using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetBlockHistory
{
    public class GetBlockHistoryHandler
        : IRequestHandler<GetBlockHistoryQuery, Result<List<BlockHistoryDto>>>
    {
        private readonly IBlockHistoryRepository _history;
        public GetBlockHistoryHandler(IBlockHistoryRepository history) => _history = history;

        public async Task<Result<List<BlockHistoryDto>>> Handle(
            GetBlockHistoryQuery request, CancellationToken ct)
        {
            var items = await _history.GetByUserIdAsync(request.UserId, ct);
            return Result<List<BlockHistoryDto>>.Success(items);
        }
    }
}
