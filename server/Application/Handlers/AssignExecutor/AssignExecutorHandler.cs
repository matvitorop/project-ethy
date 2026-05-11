using MediatR;
using server.Application.IRepositories;
using server.Domain.Chat;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.AssignExecutor
{
    public sealed class AssignExecutorHandler
        : IRequestHandler<AssignExecutorCommand, Result<AssignExecutorResult>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IMediator _mediator;

        public AssignExecutorHandler(IHelpRequestRepository repository, IMediator mediator)
        {
            _repository = repository;
            _mediator = mediator;
        }

        public async Task<Result<AssignExecutorResult>> Handle(
            AssignExecutorCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result<AssignExecutorResult>.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result<AssignExecutorResult>.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            try
            {
                helpRequest.AssignExecutor(request.ResponseId);
            }
            catch (DomainException ex)
            {
                return Result<AssignExecutorResult>.Failure(
                    new Error(ex.Message, ex.Code));
            }

            // Chat creation is done here because it is a part of the same transaction as help request update.
            var chat = new Chat(
                helpRequest.Id,
                helpRequest.CreatorId,
                helpRequest.AssignedUserId!.Value);

            var firstStage = HelpRequestStage.CreateConfirmed(
                helpRequest.Id,
                chat.Id,
                helpRequest.CreatorId,
                "Executive assigned");

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.ExecutorAssigned,
                JsonSerializer.Serialize(new
                {
                    assignedUserId = helpRequest.AssignedUserId
                }));

            await _repository.AssignExecutorAsync(helpRequest, chat, firstStage, logEvent, ct);

            await _mediator.Publish(new server.Application.Events.HelpRequestAssignedEvent(
                helpRequest.Id,
                helpRequest.Title,
                helpRequest.AssignedUserId!.Value), ct);

            return Result<AssignExecutorResult>.Success(
                new AssignExecutorResult(
                    helpRequest.Id,
                    helpRequest.AssignedUserId!.Value
                ));
        }
    }
}
