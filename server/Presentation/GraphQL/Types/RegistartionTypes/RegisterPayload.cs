namespace server.Presentation.GraphQL.Types.RegistartionTypes
{
    public record RegisterPayload(
        bool Success,
        string? Token,
        string? ErrorCode,
        string? ErrorMessage);

}
