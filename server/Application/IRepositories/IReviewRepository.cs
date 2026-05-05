using server.Application.Handlers.UserHandlers.GetUserReviews;
using server.Domain.ReviewAndComplaints;

namespace server.Application.IRepositories
{
    public interface IReviewRepository
    {
        Task AddAsync(UserReview review, CancellationToken ct);
        Task<bool> ExistsAsync(Guid helpRequestId, Guid reviewerUserId, CancellationToken ct);
        Task<IEnumerable<UserReviewDto>> GetByTargetUserAsync(Guid targetUserId, CancellationToken ct);
    }

}
