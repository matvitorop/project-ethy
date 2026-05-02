using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.HelpRequestResponseHandlers.RemoveExecutor
{
    public sealed class RemoveExecutorHandler
        : IRequestHandler<RemoveExecutorCommand, Result>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly IChatRepository _chatRepository;

        public RemoveExecutorHandler(
            IHelpRequestRepository helpRequestRepository,
            IChatRepository chatRepository)
        {
            _helpRequestRepository = helpRequestRepository;
            _chatRepository = chatRepository;
        }

        public async Task<Result> Handle(
            RemoveExecutorCommand request,
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
                helpRequest.RemoveExecutor(request.CurrentUserId, request.Reason);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            chat.Deactivate();

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.ExecutorRemoved,
                JsonSerializer.Serialize(new
                {
                    reason = request.Reason,
                    removedByUserId = request.CurrentUserId
                }));

            await _helpRequestRepository.RemoveExecutorAsync(
                helpRequest, chat, logEvent, ct);

            return Result.Success();
        }
    }
}
