using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StageTypes
{
    public sealed class StagesPayloadType : ObjectGraphType<StagesPayload>
    {
        public StagesPayloadType()
        {
            Field<ListGraphType<StageDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
