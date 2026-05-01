namespace server.Application.Handlers.User.GetProfile
{
    public sealed record ProfileDto(
        Guid Id,
        string Username,
        string Email,
        DateTime RegisteredAtUtc
    );
}
