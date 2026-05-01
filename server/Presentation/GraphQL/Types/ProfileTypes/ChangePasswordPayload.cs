using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed record ChangePasswordPayload(
        bool Success,
        ErrorPayload? Error
    );
}
