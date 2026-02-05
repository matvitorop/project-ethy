namespace server.Presentation.GraphQL.Types
{
    public sealed record ChangeHelpRequestStatusPayload(
        bool IsSuccess,
        string? ErrorCode,
        string? ErrorMessage
    );
}
