using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.CancelResponse
{
    public sealed class CancelResponseHandler
        : IRequestHandler<CancelResponseCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;

        public CancelResponseHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            CancelResponseCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            try
            {
                helpRequest.CancelResponse(request.CurrentUserId);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _repository.CancelResponseAsync(
                helpRequest.Id,
                request.CurrentUserId,
                ct);

            return Result.Success();
        }
    }
}
