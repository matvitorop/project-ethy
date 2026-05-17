using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetAdminAnalytics;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class AdminAnalyticsDtoType : ObjectGraphType<AdminAnalyticsDto>
    {
        public AdminAnalyticsDtoType()
        {
            Field(x => x.NewRequestsThisWeek);
            Field(x => x.NewRequestsLastWeek);
            Field(x => x.NewUsersThisWeek);
            Field(x => x.PendingComplaints);
            Field(x => x.TotalComplaints);
            Field(x => x.BlockedUsers);
            Field(x => x.TotalUsers);
            Field(x => x.TotalVolunteers);
            Field(x => x.TotalAdmins);
        }
    }
}
