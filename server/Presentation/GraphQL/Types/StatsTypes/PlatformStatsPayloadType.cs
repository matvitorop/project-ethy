using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class PlatformStatsPayloadType : ObjectGraphType<PlatformStatsPayload>
    {
        public PlatformStatsPayloadType()
        {
            IsTypeOf = obj => obj is PlatformStatsPayload;
            Field<PlatformStatsDtoType>("stats")
                .Resolve(ctx => ctx.Source.Stats);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
