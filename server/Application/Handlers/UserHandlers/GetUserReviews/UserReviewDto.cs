namespace server.Application.Handlers.UserHandlers.GetUserReviews
{
    public sealed record UserReviewDto(
        Guid Id,
        Guid HelpRequestId,
        Guid ReviewerUserId,
        string ReviewerUsername,
        bool IsPositive,
        string? Comment,
        DateTime CreatedAtUtc
    );

}
