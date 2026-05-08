using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class TopVolunteersPayloadType : ObjectGraphType<TopVolunteersPayload>
    {
        public TopVolunteersPayloadType()
        {
            IsTypeOf = obj => obj is TopVolunteersPayload;
            Field<TopVolunteersDtoType>("data")
                .Resolve(ctx => ctx.Source.Data);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
