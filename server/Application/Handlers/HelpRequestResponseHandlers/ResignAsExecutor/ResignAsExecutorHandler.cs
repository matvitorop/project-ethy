using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.HelpRequestResponseHandlers.ResignAsExecutor
{
    public sealed class ResignAsExecutorHandler
        : IRequestHandler<ResignAsExecutorCommand, Result>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly IChatRepository _chatRepository;

        public ResignAsExecutorHandler(
            IHelpRequestRepository helpRequestRepository,
            IChatRepository chatRepository)
        {
            _helpRequestRepository = helpRequestRepository;
            _chatRepository = chatRepository;
        }

        public async Task<Result> Handle(
            ResignAsExecutorCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _helpRequestRepository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            var chat = await _chatRepository
                .GetByHelpRequestIdAsync(request.HelpRequestId, ct);

            if (chat is null)
                return Result.Failure(
                    new Error("Chat not found", "Chat.NOT_FOUND"));

            try
            {
                helpRequest.ResignAsExecutor(request.CurrentUserId);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            chat.Deactivate();

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.ExecutorResigned,
                JsonSerializer.Serialize(new
                {
                    reason = request.Reason,
                    previousAssigneeId = request.CurrentUserId
                }));

            await _helpRequestRepository.ResignAsExecutorAsync(
                helpRequest, chat, logEvent, ct);

            return Result.Success();
        }
    }
}
