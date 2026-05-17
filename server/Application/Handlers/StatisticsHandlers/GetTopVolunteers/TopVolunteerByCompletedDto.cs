namespace server.Application.Handlers.StatisticsHandlers.GetTopVolunteers
{
    public record TopVolunteerByCompletedDto(
        Guid UserId,
        string Username,
        int CompletedCount
    );
}
