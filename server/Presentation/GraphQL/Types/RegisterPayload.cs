namespace server.Presentation.GraphQL.Types
{
    public record RegisterPayload(
        bool Success,
        string? Token,
        string? ErrorCode,
        string? ErrorMessage);

}
