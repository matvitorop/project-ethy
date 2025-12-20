namespace server.Application.Handlers.LoginUser
{
    public record LoginUserResult(
    bool Success,
    string? Token,
    string? ErrorCode,
    string? ErrorMessage
    );
}
