using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetUserReviews
{
    public sealed record GetUserReviewsQuery(Guid TargetUserId)
    : IRequest<Result<IEnumerable<UserReviewDto>>>;

}
