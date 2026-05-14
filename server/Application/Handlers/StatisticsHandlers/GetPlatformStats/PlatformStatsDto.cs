namespace server.Application.Handlers.StatisticsHandlers.GetPlatformStats
{
    public record PlatformStatsDto(
        int TotalRequests,
        int ModerationRequests,
        int OpenRequests,
        int InProgressRequests,
        int ResolvedRequests,
        int CancelledRequests,
        int RejectedRequests,
        int TotalUsers,
        int TotalVolunteers,
        double CompletionRate,
        double AvgCompletionDays
    );
}
