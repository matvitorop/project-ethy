using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.ProposeStage
{
    public sealed class ProposeStageHandler
        : IRequestHandler<ProposeStageCommand, Result<Guid>>
    {
        private readonly IStageRepository _stageRepository;
        private readonly IChatRepository _chatRepository;

        public ProposeStageHandler(IStageRepository stageRepository, IChatRepository chatRepository)
        {
            _stageRepository = stageRepository;
            _chatRepository = chatRepository;
        }

        public async Task<Result<Guid>> Handle(
            ProposeStageCommand request, CancellationToken ct)
        {
            //Check if chat exists and user has access
            var chat = await _chatRepository
                .GetByHelpRequestIdAsync(request.HelpRequestId, ct);

            if (chat is null)
                return Result<Guid>.Failure(
                    new Error("Chat not found", "Chat.NOT_FOUND"));

            if (chat.OwnerId != request.UserId &&
                chat.AssigneeId != request.UserId)
                return Result<Guid>.Failure(
                    new Error("Access denied", "Chat.FORBIDDEN"));

            //Check if there is already a pending stage for this help request
            var hasActive = await _stageRepository
                .HasActiveProposedStageAsync(request.HelpRequestId, request.ChatId, ct);

            if (hasActive)
                return Result<Guid>.Failure(
                    new Error(
                        "There is already a pending stage",
                        "HelpRequestStage.PENDING_EXISTS"));

            try
            {
                var stage = new HelpRequestStage(
                    request.HelpRequestId,
                    request.ChatId,
                    request.UserId,
                    request.Content);

                var logEvent = new HelpRequestEvent(
                    request.HelpRequestId,
                    request.UserId,
                    HelpRequestEventType.StageProposed,
                    JsonSerializer.Serialize(new
                    {
                        stageId = stage.Id,
                        content = stage.Content
                    }));

                await _stageRepository.AddAsync(stage, logEvent, ct);

                return Result<Guid>.Success(stage.Id);
            }
            catch (DomainException ex)
            {
                return Result<Guid>.Failure(new Error(ex.Message, ex.Code));
            }
        }
    }
}
