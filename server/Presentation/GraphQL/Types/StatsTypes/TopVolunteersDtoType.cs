using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class TopVolunteersDtoType : ObjectGraphType<TopVolunteersDto>
    {
        public TopVolunteersDtoType()
        {
            Field<ListGraphType<TopVolunteerByCompletedDtoType>>("byCompleted")
                .Resolve(ctx => ctx.Source.ByCompleted);
            Field<ListGraphType<TopVolunteerByReviewsDtoType>>("byReviews")
                .Resolve(ctx => ctx.Source.ByReviews);
        }
    }
}
