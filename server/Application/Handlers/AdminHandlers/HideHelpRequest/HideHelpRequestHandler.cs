using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
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
            var logEvent = new HelpRequestEvent(
                request.HelpRequestId,
                request.AdminId,
                request.Hide ? HelpRequestEventType.Hidden : HelpRequestEventType.Unhidden,
                System.Text.Json.JsonSerializer.Serialize(new { hiddenBy = request.AdminId })
            );
            await _repo.SetHiddenAsync(request.HelpRequestId, request.Hide, logEvent, ct);
            return Result<bool>.Success(true);
        }
    }
}
