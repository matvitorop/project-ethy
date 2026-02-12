namespace server.Presentation.GraphQL.Types.ChangeHRStatusTypes
{
    public sealed record ChangeHelpRequestStatusPayload(
        bool IsSuccess,
        string? ErrorCode,
        string? ErrorMessage
    );
}
