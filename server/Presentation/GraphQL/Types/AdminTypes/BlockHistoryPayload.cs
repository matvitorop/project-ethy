using server.Application.Handlers.UserHandlers.GetBlockHistory;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public record BlockHistoryPayload(List<BlockHistoryDto>? Items, ErrorPayload? Error);
}
