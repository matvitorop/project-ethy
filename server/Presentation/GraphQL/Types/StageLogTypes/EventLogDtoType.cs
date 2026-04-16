using GraphQL.Types;
using server.Application.Handlers.GetStages;

namespace server.Presentation.GraphQL.Types.StageLogTypes
{
    public sealed class EventLogDtoType : ObjectGraphType<EventLogDto>
    {
        public EventLogDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.ActorId, type: typeof(GuidGraphType));
            Field(x => x.EventType);
            Field(x => x.Payload);
            Field(x => x.CreatedAtUtc);
        }
    }
}
