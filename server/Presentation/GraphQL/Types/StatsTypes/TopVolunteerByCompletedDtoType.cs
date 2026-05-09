using GraphQL.Types;
using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class TopVolunteerByCompletedDtoType : ObjectGraphType<TopVolunteerByCompletedDto>
    {
        public TopVolunteerByCompletedDtoType()
        {
            Field(x => x.UserId, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.CompletedCount);
        }
    }
}
