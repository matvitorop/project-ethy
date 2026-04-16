using server.Application.Handlers.GetStages;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StageLogTypes
{
    public sealed record EventLogPayload(
        IReadOnlyList<EventLogDto>? Items,
        ErrorPayload? Error
    );
}
