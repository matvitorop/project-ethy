using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetUserStatistic
{
    public sealed class GetUserStatisticsPayloadType
    : ObjectGraphType<GetUserStatisticPayload>
    {
        public GetUserStatisticsPayloadType()
        {
            Name = "GetUserStatisticsPayload";

            Field<UserStatisticsGraphType>("statistic")
                .Resolve(ctx => ctx.Source.Data);

            Field<ErrorPayloadType>("error").
                Resolve(ctx => ctx.Source.Error);
        }
    }
}
