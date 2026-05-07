using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.HideHelpRequest
{
    public class HideHelpRequestHandler
        : IRequestHandler<HideHelpRequestCommand, Result<bool>>
    {
        private readonly IHelpRequestRepository _repo;
        public HideHelpRequestHandler(IHelpRequestRepository repo) => _repo = repo;

        public async Task<Result<bool>> Handle(
            HideHelpRequestCommand request, CancellationToken ct)
        {
            await _repo.SetHiddenAsync(request.HelpRequestId, request.Hide, ct);
            return Result<bool>.Success(true);
        }
    }
}
