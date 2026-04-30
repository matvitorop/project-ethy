using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.SoftDeleteHelpRequest
{
    public sealed class SoftDeleteHelpRequestHandler
        : IRequestHandler<SoftDeleteHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public SoftDeleteHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            SoftDeleteHelpRequestCommand request,
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
                helpRequest.Delete();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _repository.SoftDeleteAsync(helpRequest.Id, ct);

            return Result.Success();
        }
    }
}
