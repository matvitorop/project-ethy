namespace server.Application.Handlers.StatisticsHandlers.GetTopVolunteers
{
    public record TopVolunteerByReviewsDto(
        Guid UserId,
        string Username,
        int PositiveReviews
    );
}
