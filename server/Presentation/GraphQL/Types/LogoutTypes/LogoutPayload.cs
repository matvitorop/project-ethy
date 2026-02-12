using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.LogoutTypes
{
    public sealed record LogoutPayload(
        string? Message,
        ErrorPayload? Error
    );
}
