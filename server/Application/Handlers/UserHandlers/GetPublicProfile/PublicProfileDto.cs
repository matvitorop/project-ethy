namespace server.Application.Handlers.UserHandlers.GetPublicProfile
{
    public record PublicProfileDto(
        Guid Id,
        string Username,
        int Role,
        DateTime RegisteredAtUtc,
        bool IsEmailVerified,
        bool HasPhone,
        bool HasSocialLinks,
        string? PhoneNumber, 
        string? SocialLinks,
        int PositiveReviews,
        int NegativeReviews,
        int TotalRequests,
        int CompletedRequests,
        int HelpedRequests,
        int RejectedRequests,
        DateTime? LastActivityAtUtc
    );
}
