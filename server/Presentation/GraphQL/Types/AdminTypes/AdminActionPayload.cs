using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public record AdminActionPayload(bool? Success, ErrorPayload? Error);
}
