using Azure.Core;
using GraphQL;
using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

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
            {
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error("Help request not found", "HelpRequest.HR_STATUS_NOT_FOUND"));
            }

            if (helpRequest.CreatorId != request.CurrentUserId)
            {
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error("Forbidden", "HelpRequest.FORBIDDEN"));
            }

            try
            {
                ApplyStatus(helpRequest, request.NewStatus);
            }
            catch (DomainException ex)
            {
                return Result<ChangeHelpRequestStatusResult>.Failure(
                    new Error(
                        ex.Message,
                        ex.Code));
            }

            await _repository.UpdateStatusAsync(
                ct,
                helpRequest.Id,
                helpRequest.Status
                );

            return Result<ChangeHelpRequestStatusResult>.Success(
                new ChangeHelpRequestStatusResult(
                    helpRequest.Id,
                    helpRequest.Status
                )
            );
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
