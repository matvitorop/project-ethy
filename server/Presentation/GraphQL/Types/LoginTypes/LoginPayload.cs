namespace server.Presentation.GraphQL.Types.LoginTypes
{
    public record LoginPayload(
        bool Success,
        string? Token,
        string? ErrorCode,
        string? ErrorMessage);
}
