namespace server.Application.Handlers.StatisticsHandlers.GetPlatformStats
{
    public record PlatformStatsDto(
        int TotalRequests,
        int DraftRequests,
        int OpenRequests,
        int InProgressRequests,
        int ResolvedRequests,
        int CancelledRequests,
        int TotalUsers,
        int TotalVolunteers,
        double CompletionRate,
        double AvgCompletionDays
    );
}
