namespace server.Application.Handlers.GetHelpRequestResponses
{
    public sealed record HelpRequestResponseDto(
        Guid Id,
        Guid UserId,
        string Message,
        int Status,
        DateTime CreatedAtUtc
    );
}
