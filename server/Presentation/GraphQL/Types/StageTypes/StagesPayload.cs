using server.Application.Handlers.GetStages;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StageTypes
{
    public sealed record StagesPayload(
        IReadOnlyList<StageDto>? Items,
        ErrorPayload? Error
    );
}
