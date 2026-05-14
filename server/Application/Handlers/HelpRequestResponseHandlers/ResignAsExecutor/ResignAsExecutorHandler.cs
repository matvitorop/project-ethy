using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Notifications;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.HelpRequestResponseHandlers.ResignAsExecutor
{
    public sealed class ResignAsExecutorHandler
        : IRequestHandler<ResignAsExecutorCommand, Result>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly IChatRepository _chatRepository;
        private readonly INotificationService _notificationService;
        private readonly IUserRepository _userRepository;

        public ResignAsExecutorHandler(
            IHelpRequestRepository helpRequestRepository,
            IChatRepository chatRepository,
            INotificationService notificationService,
            IUserRepository userRepository)
        {
            _helpRequestRepository = helpRequestRepository;
            _chatRepository = chatRepository;
            _notificationService = notificationService;
            _userRepository = userRepository;
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

            var resigningUser = await _userRepository.GetByIdAsync(request.CurrentUserId, ct);
            var resigningUsername = resigningUser?.Username ?? "Помічник";

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

            // Send notification to owner via service (SignalR + DB)
            await _notificationService.SendNotificationAsync(
                helpRequest.CreatorId,
                "Відмова від виконання",
                $"{resigningUsername} припинив допомогу у вашій заявці \"{helpRequest.Title}\". Причина: {request.Reason}",
                NotificationType.HelpRequest,
                helpRequest.Id,
                "HelpRequest",
                ct
            );

            return Result.Success();
        }
    }
}
