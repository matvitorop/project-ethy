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

            var responses = await _repository
                .GetResponsesByHelpRequestIdAsync(ct, request.HelpRequestId);

            if (ownerId != request.RequestingUserId)
            {
                var userResponses = responses.Where(r => r.UserId == request.RequestingUserId).ToList();
                return Result<IReadOnlyList<HelpRequestResponseDto>>.Success(userResponses);
            }

            return Result<IReadOnlyList<HelpRequestResponseDto>>.Success(responses);
        }
    }
}
