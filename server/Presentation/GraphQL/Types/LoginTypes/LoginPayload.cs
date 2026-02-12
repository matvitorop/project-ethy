using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.LoginTypes
{
    public record LoginPayload(
        string? Token,
        ErrorPayload? Error
    );
}
