using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetFullHelpRequest
{
    public sealed class GetHelpRequestByIdHandler : IRequestHandler<GetFullHelpRequestQuery, Result<HelpRequestDetailDto>>
    {
        private readonly IHelpRequestRepository _repo;

        public GetHelpRequestByIdHandler(IHelpRequestRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<HelpRequestDetailDto>> Handle(
            GetFullHelpRequestQuery request,
            CancellationToken ct)
        {
            var item = await _repo.GetHelpRequestById(ct, request.HelpRequestId);

            if (item is null)
            {
                return Result<HelpRequestDetailDto>.Failure(
                    new Error(
                        "Help request not found.",
                        "HelpRequest.REQUEST_NOT_FOUND"
                    )
                );
            }

            return Result<HelpRequestDetailDto>.Success(item);
        }
    }
}