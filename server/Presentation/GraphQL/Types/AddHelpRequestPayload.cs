namespace server.Presentation.GraphQL.Types
{
    public record AddHelpRequestPayload(
        bool Success,
        Guid? HelpRequestId,
        string? ErrorCode,
        string? ErrorMessage);
}
