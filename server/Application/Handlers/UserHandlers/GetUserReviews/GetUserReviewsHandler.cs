using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetUserReviews
{
    public sealed class GetUserReviewsHandler
    : IRequestHandler<GetUserReviewsQuery, Result<IEnumerable<UserReviewDto>>>
    {
        private readonly IReviewRepository _reviewRepository;

        public GetUserReviewsHandler(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public async Task<Result<IEnumerable<UserReviewDto>>> Handle(
            GetUserReviewsQuery request,
            CancellationToken ct)
        {
            var reviews = await _reviewRepository
                .GetByTargetUserAsync(request.TargetUserId, ct);

            return Result<IEnumerable<UserReviewDto>>.Success(reviews);
        }
    }

}
