namespace server.Application.Handlers.RegisterUser
{
    public record RegisterUserResult(bool Success, string? Token, string? ErrorCode, string? ErrorMessage);
}