using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class AdminAnalyticsPayloadType : ObjectGraphType<AdminAnalyticsPayload>
    {
        public AdminAnalyticsPayloadType()
        {
            IsTypeOf = obj => obj is AdminAnalyticsPayload;
            Field<AdminAnalyticsDtoType>("data").Resolve(ctx => ctx.Source.Data);
            Field<ErrorPayloadType>("error").Resolve(ctx => ctx.Source.Error);
        }
    }
}
