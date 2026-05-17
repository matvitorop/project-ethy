using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using server.Domain.ReviewAndComplaints;

namespace server.Application.Handlers.UserHandlers.LeaveReview
{
    public sealed class LeaveReviewHandler
    : IRequestHandler<LeaveReviewCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly IReviewRepository _reviewRepository;

        public LeaveReviewHandler(
            IHelpRequestRepository helpRequestRepository,
            IReviewRepository reviewRepository)
        {
            _helpRequestRepository = helpRequestRepository;
            _reviewRepository = reviewRepository;
        }

        public async Task<Result<Guid>> Handle(
            LeaveReviewCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _helpRequestRepository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result<Guid>.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (helpRequest.Status != HelpRequestStatus.Resolved)
                return Result<Guid>.Failure(
                    new Error("Reviews can only be left for resolved requests", "Review.REQUEST_NOT_RESOLVED"));

            Guid targetUserId;
            if (helpRequest.AssignedUserId == request.ReviewerUserId)
            {
                // Виконавець пише відгук власнику
                targetUserId = helpRequest.CreatorId;
            }
            else if (helpRequest.CreatorId == request.ReviewerUserId)
            {
                // Власник пише відгук виконавцю
                if (!helpRequest.AssignedUserId.HasValue)
                    return Result<Guid>.Failure(new Error("No assignee to leave a review for", "Review.NO_ASSIGNEE"));
                
                targetUserId = helpRequest.AssignedUserId.Value;
            }
            else
            {
                return Result<Guid>.Failure(
                    new Error("Only the owner or the assigned executor can leave a review", "Review.NOT_AUTHORIZED"));
            }

            var alreadyExists = await _reviewRepository
                .ExistsAsync(request.HelpRequestId, request.ReviewerUserId, ct);

            if (alreadyExists)
                return Result<Guid>.Failure(
                    new Error("Review already submitted for this request", "Review.ALREADY_EXISTS"));

            var review = new UserReview(
                helpRequestId: request.HelpRequestId,
                reviewerUserId: request.ReviewerUserId,
                targetUserId: targetUserId,
                isPositive: request.IsPositive,
                comment: request.Comment);

            await _reviewRepository.AddAsync(review, ct);

            return Result<Guid>.Success(review.Id);
        }
    }

}
