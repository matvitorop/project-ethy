using Azure.Core;
using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.ChangeHelpRequestStatus
{
    public sealed class ChangeHelpRequestStatusHandler
    : IRequestHandler<ChangeHelpRequestStatusCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public ChangeHelpRequestStatusHandler(
            IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            ChangeHelpRequestStatusCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetHelpRequestById(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NotFound"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result.Failure(
                    new Error("Forbidden", "HelpRequest.FORBIDDEN"));

            try
            {
                ApplyStatus(helpRequest, request.NewStatus);
            }
            catch (InvalidOperationException)
            {
                return Result.Failure(
                    new Error(
                        "Invalid status transition",
                        "INVALID_STATUS_TRANSITION"));
            }

            await _repository.UpdateAsync(helpRequest, ct);

            return Result.Success();
        }

        private static void ApplyStatus(
            HelpRequest helpRequest,
            HelpRequestStatus status)
        {
            switch (status)
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
