using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.LeaveReview
{
    public sealed record LeaveReviewCommand(
        Guid HelpRequestId,
        Guid ReviewerUserId,
        bool IsPositive,
        string? Comment
    ) : IRequest<Result<Guid>>;

}
