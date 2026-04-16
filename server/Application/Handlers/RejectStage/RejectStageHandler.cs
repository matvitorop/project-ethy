using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.RejectStage
{
    public sealed class RejectStageHandler
        : IRequestHandler<RejectStageCommand, Result>
    {
        private readonly IStageRepository _stageRepository;

        public RejectStageHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result> Handle(
            RejectStageCommand request, CancellationToken ct)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId, ct);

            if (stage is null)
                return Result.Failure(
                    new Error("Stage not found", "HelpRequestStage.NOT_FOUND"));

            try
            {
                stage.Reject(request.UserId, request.Reason);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                stage.HelpRequestId,
                request.UserId,
                HelpRequestEventType.StageRejected,
                JsonSerializer.Serialize(new
                {
                    stageId = stage.Id,
                    reason = request.Reason
                }));

            await _stageRepository.UpdateAsync(stage, logEvent, ct);

            return Result.Success();
        }
    }
}
