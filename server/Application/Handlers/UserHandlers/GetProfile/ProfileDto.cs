namespace server.Application.Handlers.UserHandlers.GetProfile
{
    public sealed record ProfileDto(
        Guid Id,
        string Username,
        string Email,
        DateTime RegisteredAtUtc,
        
        // Trust module
        string? PhoneNumber,
        string? SocialLinks,
        bool IsEmailVerified,
        string Role,
        int ActiveRequestsCount,
        int ActiveResponsesCount
    // ---

    );
}
