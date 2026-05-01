using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.CancelHelpRequest
{
    public sealed class CancelHelpRequestHandler
        : IRequestHandler<CancelHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public CancelHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            CancelHelpRequestCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            // Перевіряємо що це власник або виконавець
            var isOwner = helpRequest.CreatorId == request.CurrentUserId;
            var isAssignee = helpRequest.AssignedUserId == request.CurrentUserId;

            if (!isOwner && !isAssignee)
                return Result.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            try
            {
                helpRequest.Cancel(request.Reason);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.StatusChanged,
                JsonSerializer.Serialize(new
                {
                    previousStatus = "InProgress or Open",
                    newStatus = "Cancelled",
                    reason = request.Reason,
                    cancelledBy = isOwner ? "Owner" : "Assignee"
                }));

            await _repository.CancelAsync(helpRequest, logEvent, ct);

            return Result.Success();
        }
    }
}
