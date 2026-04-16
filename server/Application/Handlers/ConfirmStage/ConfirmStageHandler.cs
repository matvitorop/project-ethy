using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.ConfirmStage
{
    public sealed class ConfirmStageHandler
        : IRequestHandler<ConfirmStageCommand, Result>
    {
        private readonly IStageRepository _stageRepository;

        public ConfirmStageHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result> Handle(
            ConfirmStageCommand request, CancellationToken ct)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId, ct);

            if (stage is null)
                return Result.Failure(
                    new Error("Stage not found", "HelpRequestStage.NOT_FOUND"));

            try
            {
                stage.Confirm(request.UserId);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                stage.HelpRequestId,
                request.UserId,
                HelpRequestEventType.StageConfirmed,
                JsonSerializer.Serialize(new
                {
                    stageId = stage.Id,
                    content = stage.Content
                }));

            await _stageRepository.UpdateAsync(stage, logEvent, ct);

            return Result.Success();
        }
    }
}
