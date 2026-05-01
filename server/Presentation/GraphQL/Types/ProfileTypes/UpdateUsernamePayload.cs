using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed record UpdateUsernamePayload(
        bool Success,
        ErrorPayload? Error
    );
}
