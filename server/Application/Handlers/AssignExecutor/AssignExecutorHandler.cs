using MediatR;
using server.Application.IRepositories;
using server.Domain.Chat;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.AssignExecutor
{
    public sealed class AssignExecutorHandler
        : IRequestHandler<AssignExecutorCommand, Result<AssignExecutorResult>>
    {
        private readonly IHelpRequestRepository _repository;

        public AssignExecutorHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
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

            await _repository.AssignExecutorAsync(helpRequest, chat, ct);

            return Result<AssignExecutorResult>.Success(
                new AssignExecutorResult(
                    helpRequest.Id,
                    helpRequest.AssignedUserId!.Value
                ));
        }
    }
}
