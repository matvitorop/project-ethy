namespace server.Application.Handlers.StatisticsHandlers.GetTopVolunteers
{
    public record TopVolunteersDto(
        List<TopVolunteerByCompletedDto> ByCompleted,
        List<TopVolunteerByReviewsDto> ByReviews
    );
}
