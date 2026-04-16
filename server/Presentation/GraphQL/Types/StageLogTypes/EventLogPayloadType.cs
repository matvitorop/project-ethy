using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StageLogTypes
{
    public sealed class EventLogPayloadType : ObjectGraphType<EventLogPayload>
    {
        public EventLogPayloadType()
        {
            Field<ListGraphType<EventLogDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
