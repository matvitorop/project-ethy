using Azure.Core;
using GraphQL;
using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;
using server.Application.Events;

namespace server.Application.Handlers.ChangeHelpRequestStatus
{
    public sealed class ChangeHelpRequestStatusHandler
    : IRequestHandler<ChangeHelpRequestStatusCommand, Result<ChangeHelpRequestStatusResult>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IStageRepository _stageRepository;
        private readonly IMediator _mediator;

        public ChangeHelpRequestStatusHandler(
            IHelpRequestRepository repository,
            IStageRepository stageRepository,
            IMediator mediator)
        {
            _repository = repository;
            _stageRepository = stageRepository;
            _mediator = mediator;
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

            // Prevent completion when a stage is still awaiting review
            if (request.NewStatus == HelpRequestStatus.Resolved)
            {
                var hasPendingStages = await _stageRepository
                    .HasAnyProposedStageAsync(request.HelpRequestId, ct);

                if (hasPendingStages)
                    return Result<ChangeHelpRequestStatusResult>.Failure(
                        new Error(
                            "Cannot complete a request that has pending stages. Resolve or reject all stages first.",
                            "HelpRequest.HAS_PENDING_STAGES"));
            }

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

            if (helpRequest.AssignedUserId.HasValue)
            {
                await _mediator.Publish(new HelpRequestStatusChangedEvent(
                    helpRequest.Id,
                    helpRequest.Title,
                    helpRequest.AssignedUserId.Value,
                    helpRequest.Status), ct);
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
