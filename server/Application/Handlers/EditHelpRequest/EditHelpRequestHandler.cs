using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.EditHelpRequest
{
    public sealed class EditHelpRequestHandler
        : IRequestHandler<EditHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public EditHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            EditHelpRequestCommand request,
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
                helpRequest.Edit(
                    request.Title,
                    request.Description,
                    request.Latitude,
                    request.Longitude);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.HelpRequestEdited,
                JsonSerializer.Serialize(new
                {
                    title = helpRequest.Title,
                    description = helpRequest.Description
                }));

            await _repository.EditAsync(helpRequest, logEvent, ct);

            return Result.Success();
        }
    }
}
