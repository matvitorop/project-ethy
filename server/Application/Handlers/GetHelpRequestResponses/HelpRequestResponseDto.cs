namespace server.Application.Handlers.GetHelpRequestResponses
{
    public sealed record HelpRequestResponseDto(
        Guid Id,
        Guid UserId,
        string Username,
        string Message,
        int Status,
        DateTime CreatedAtUtc
    );
}
