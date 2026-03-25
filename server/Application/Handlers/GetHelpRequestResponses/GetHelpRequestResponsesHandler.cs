using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetHelpRequestResponses
{
    public sealed class GetHelpRequestResponsesHandler
        : IRequestHandler<GetHelpRequestResponsesQuery, Result<IReadOnlyList<HelpRequestResponseDto>>>
    {
        private readonly IHelpRequestRepository _repository;

        public GetHelpRequestResponsesHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<IReadOnlyList<HelpRequestResponseDto>>> Handle(
            GetHelpRequestResponsesQuery request,
            CancellationToken ct)
        {
            var ownerId = await _repository.GetCreatorIdAsync(ct, request.HelpRequestId);

            if (ownerId is null)
                return Result<IReadOnlyList<HelpRequestResponseDto>>.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (ownerId != request.RequestingUserId)
                return Result<IReadOnlyList<HelpRequestResponseDto>>.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            var responses = await _repository
                .GetResponsesByHelpRequestIdAsync(ct, request.HelpRequestId);

            return Result<IReadOnlyList<HelpRequestResponseDto>>.Success(responses);
        }
    }
}
