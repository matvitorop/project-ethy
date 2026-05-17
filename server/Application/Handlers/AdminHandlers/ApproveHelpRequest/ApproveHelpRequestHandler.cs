using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;
using server.Domain.Notifications;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.AdminHandlers.ApproveHelpRequest
{
    public class ApproveHelpRequestHandler : IRequestHandler<ApproveHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly INotificationService _notificationService;

        public ApproveHelpRequestHandler(
            IHelpRequestRepository helpRequestRepository,
            INotificationService notificationService)
        {
            _helpRequestRepository = helpRequestRepository;
            _notificationService = notificationService;
        }

        public async Task<Result> Handle(ApproveHelpRequestCommand request, CancellationToken ct)
        {
            var helpRequest = await _helpRequestRepository.GetAggregateByIdAsync(ct, request.HelpRequestId);
            if (helpRequest == null || helpRequest.IsDeleted)
                return Result.Failure(new Error("Дана заявка вже видалена користувачем", "HelpRequest.ALREADY_DELETED"));

            try
            {
                helpRequest.Approve();
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.AdminId,
                HelpRequestEventType.ModerationApproved,
                JsonSerializer.Serialize(new { approvedBy = request.AdminId }));

            await _helpRequestRepository.UpdateAsync(helpRequest, logEvent, ct);

            // Send notification to the creator
            await _notificationService.SendNotificationAsync(
                helpRequest.CreatorId,
                "Заявку схвалено",
                $"Ваша заявка \"{helpRequest.Title}\" пройшла модерацію і тепер доступна для всіх.",
                NotificationType.HelpRequest,
                helpRequest.Id,
                "HelpRequest",
                ct);

            return Result.Success();
        }
    }
}
