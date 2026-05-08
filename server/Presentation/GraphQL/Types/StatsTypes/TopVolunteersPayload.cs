using server.Application.Handlers.StatisticsHandlers.GetTopVolunteers;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.StatsTypes
{
    public record TopVolunteersPayload(TopVolunteersDto? Data, ErrorPayload? Error);
}
