namespace server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics
{
    public record AdminAnalyticsDto(
        int NewRequestsThisWeek,
        int NewRequestsLastWeek,
        int NewUsersThisWeek,
        int PendingComplaints,
        int TotalComplaints,
        int BlockedUsers,
        int TotalUsers,
        int TotalVolunteers,
        int TotalAdmins
);
}
