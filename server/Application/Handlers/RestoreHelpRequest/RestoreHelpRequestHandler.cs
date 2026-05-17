using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using server.Domain;
using System.Text.Json;

namespace server.Application.Handlers.RestoreHelpRequest
{
    public sealed class RestoreHelpRequestHandler
        : IRequestHandler<RestoreHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IUserRepository _userRepository;

        public RestoreHelpRequestHandler(IHelpRequestRepository repository, IUserRepository userRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
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
                var user = await _userRepository.GetByIdAsync(request.CurrentUserId, ct);
                if (user != null && user.Role == UserRole.User)
                {
                    var activeCount = await _repository.CountActiveRequestsByCreatorAsync(request.CurrentUserId, ct);
                    if (activeCount >= 3)
                    {
                        return Result.Failure(
                            new Error(
                                "Cannot restore. You already have 3 active help requests. Delete or complete one to restore this one.",
                                "HelpRequest.LIMIT_EXCEEDED"
                            ));
                    }
                }

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
                    newStatus = "Moderation",
                    note = "Request restored by owner"
                }));

            await _repository.RestoreAsync(helpRequest, logEvent, ct);

            return Result.Success();
        }
    }
}
