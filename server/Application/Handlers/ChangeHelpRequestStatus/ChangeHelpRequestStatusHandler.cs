using Azure.Core;
using GraphQL;
using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.ChangeHelpRequestStatus
{
    public sealed class ChangeHelpRequestStatusHandler
    : IRequestHandler<ChangeHelpRequestStatusCommand, Result<ChangeHelpRequestStatusResult>>
    {
        private readonly IHelpRequestRepository _repository;

        public ChangeHelpRequestStatusHandler(
            IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<ChangeHelpRequestStatusResult>> Handle(
            ChangeHelpRequestStatusCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error("Help request not found", "HelpRequest.HR_STATUS_NOT_FOUND"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error("Forbidden", "HelpRequest.FORBIDDEN"));

            // Зберігаємо попередній статус для логу
            var previousStatus = helpRequest.Status;

            try
            {
                ApplyStatus(helpRequest, request.NewStatus);
            }
            catch (DomainException ex)
            {
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error(ex.Message, ex.Code));
            }

            // Створюємо подію після успішної зміни статусу
            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.StatusChanged,
                JsonSerializer.Serialize(new
                {
                    previousStatus = previousStatus.ToString(),
                    newStatus = helpRequest.Status.ToString()
                }));

            var requiresFullUpdate = request.NewStatus == HelpRequestStatus.Cancelled;

            if (requiresFullUpdate)
                await _repository.UpdateAsync(helpRequest, logEvent, ct);
            else
                await _repository.UpdateStatusAsync(ct, helpRequest.Id, helpRequest.Status, logEvent);

            if (request.NewStatus == HelpRequestStatus.Resolved)
            {
                await _repository.SetResolvedAtAsync(helpRequest.Id, ct);
            }

            return Result<ChangeHelpRequestStatusResult>.Success(
                new ChangeHelpRequestStatusResult(
                    helpRequest.Id,
                    helpRequest.Status));
        }

        private static void ApplyStatus(
            HelpRequest helpRequest,
            HelpRequestStatus newStatus)
        {
            switch (newStatus)
            {
                case HelpRequestStatus.InProgress:
                    helpRequest.MarkInProgress();
                    break;

                case HelpRequestStatus.Resolved:
                    helpRequest.Complete();
                    break;

                case HelpRequestStatus.Cancelled:
                    helpRequest.Cancel();
                    break;

                default:
                    throw new InvalidOperationException();
            }
        }
    }
}
