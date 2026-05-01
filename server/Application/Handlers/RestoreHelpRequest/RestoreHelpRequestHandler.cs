using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.RestoreHelpRequest
{
    public sealed class RestoreHelpRequestHandler
        : IRequestHandler<RestoreHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public RestoreHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            RestoreHelpRequestCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            try
            {
                helpRequest.Restore();
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
                    previousStatus = "Cancelled",
                    newStatus = "Open",
                    note = "Request restored by owner"
                }));

            await _repository.RestoreAsync(helpRequest, logEvent, ct);

            return Result.Success();
        }
    }
}
