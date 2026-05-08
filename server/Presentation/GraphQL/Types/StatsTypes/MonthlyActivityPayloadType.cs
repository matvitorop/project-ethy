using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public class MonthlyActivityPayloadType : ObjectGraphType<MonthlyActivityPayload>
    {
        public MonthlyActivityPayloadType()
        {
            IsTypeOf = obj => obj is MonthlyActivityPayload;
            Field<ListGraphType<MonthlyActivityDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
