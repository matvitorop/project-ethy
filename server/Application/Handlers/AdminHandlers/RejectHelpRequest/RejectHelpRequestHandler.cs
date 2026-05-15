using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;
using server.Domain.Notifications;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.AdminHandlers.RejectHelpRequest
{
    public class RejectHelpRequestHandler : IRequestHandler<RejectHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly INotificationService _notificationService;

        public RejectHelpRequestHandler(
            IHelpRequestRepository helpRequestRepository,
            INotificationService notificationService)
        {
            _helpRequestRepository = helpRequestRepository;
            _notificationService = notificationService;
        }

        public async Task<Result> Handle(RejectHelpRequestCommand request, CancellationToken ct)
        {
            var helpRequest = await _helpRequestRepository.GetAggregateByIdAsync(ct, request.HelpRequestId);
            if (helpRequest == null || helpRequest.IsDeleted)
                return Result.Failure(new Error("Дана заявка вже видалена користувачем", "HelpRequest.ALREADY_DELETED"));

            try
            {
                helpRequest.RejectModeration(request.Reason);
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.AdminId,
                HelpRequestEventType.ModerationRejected,
                JsonSerializer.Serialize(new { rejectedBy = request.AdminId, reason = request.Reason }));

            await _helpRequestRepository.UpdateAsync(helpRequest, logEvent, ct);

            // Send notification to the creator
            await _notificationService.SendNotificationAsync(
                helpRequest.CreatorId,
                "Заявку відхилено модератором",
                $"Ваша заявка \"{helpRequest.Title}\" не пройшла модерацію. Причина: {request.Reason}",
                NotificationType.HelpRequest,
                helpRequest.Id,
                "HelpRequest",
                ct);

            return Result.Success();
        }
    }
}
