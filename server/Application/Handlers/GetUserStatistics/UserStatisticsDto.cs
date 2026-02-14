namespace server.Application.Handlers.GetUserStatistics
{
    public sealed record UserStatisticsDto(DateTime RegisteredAtUtc, int TotalRequests, int ActiveRequests, int CompletedRequests);
}
