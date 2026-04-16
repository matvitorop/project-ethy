using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.DeleteStage
{
    public sealed class DeleteStageHandler
        : IRequestHandler<DeleteStageCommand, Result>
    {
        private readonly IStageRepository _stageRepository;

        public DeleteStageHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result> Handle(
            DeleteStageCommand request, CancellationToken ct)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId, ct);

            if (stage is null)
                return Result.Failure(
                    new Error("Stage not found", "HelpRequestStage.NOT_FOUND"));

            try
            {
                stage.Delete(request.UserId);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                stage.HelpRequestId,
                request.UserId,
                HelpRequestEventType.StageDeleted,
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
