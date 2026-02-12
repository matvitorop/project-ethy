namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public record AddHelpRequestPayload(
        bool Success,
        Guid? HelpRequestId,
        string? ErrorCode,
        string? ErrorMessage);
}
