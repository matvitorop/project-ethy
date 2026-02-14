using GraphQL.Types;
using server.Application.Handlers.GetUserStatistics;

namespace server.Presentation.GraphQL.Types.GetUserStatistic
{
    public sealed class UserStatisticsGraphType : ObjectGraphType<UserStatisticsDto>
    {
        public UserStatisticsGraphType()
        {
            Name = "UserStatistics";

            Field(x => x.RegisteredAtUtc);
            Field(x => x.TotalRequests);
            Field(x => x.ActiveRequests);
            Field(x => x.CompletedRequests);
        }
    }
}
