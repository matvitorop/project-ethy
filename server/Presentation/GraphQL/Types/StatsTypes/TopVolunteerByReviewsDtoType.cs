using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class TopVolunteerByReviewsDtoType : ObjectGraphType<TopVolunteerByReviewsDto>
    {
        public TopVolunteerByReviewsDtoType()
        {
            Field(x => x.UserId, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.PositiveReviews);
        }
    }
}
