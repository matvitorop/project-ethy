namespace server.Application.Handlers.EditHelpRequest
{
    public sealed record EditHelpRequestResult(
        Guid HelpRequestId,
        string Title,
        string Description,
        DateTime? UpdatedAtUtc
    );
}
