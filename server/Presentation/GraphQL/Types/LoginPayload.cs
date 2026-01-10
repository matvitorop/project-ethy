namespace server.Presentation.GraphQL.Types
{
    public record LoginPayload(
        bool Success,
        string? Token,
        string? ErrorCode,
        string? ErrorMessage);
}
