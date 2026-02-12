using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RegistartionTypes
{
    public record RegisterPayload(
        string? Token,
        ErrorPayload? Error
    );

}
