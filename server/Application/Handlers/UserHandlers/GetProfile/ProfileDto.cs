namespace server.Application.Handlers.UserHandlers.GetProfile
{
    public sealed record ProfileDto(
        Guid Id,
        string Username,
        string Email,
        DateTime RegisteredAtUtc
    );
}
