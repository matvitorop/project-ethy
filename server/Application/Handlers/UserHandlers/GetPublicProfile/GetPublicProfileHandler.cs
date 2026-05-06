using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetPublicProfile
{
    public class GetPublicProfileHandler
        : IRequestHandler<GetPublicProfileQuery, Result<PublicProfileDto>>
    {
        private readonly IUserRepository _users;

        public GetPublicProfileHandler(IUserRepository users) => _users = users;

        public async Task<Result<PublicProfileDto>> Handle(
            GetPublicProfileQuery request,
            CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.TargetUserId, ct);
            if (user is null || user.IsDeleted)
                return Result<PublicProfileDto>.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            var stats = await _users.GetUserStatisticsAsync(request.TargetUserId, ct);

            return Result<PublicProfileDto>.Success(new PublicProfileDto(
                Id: user.Id,
                Username: user.Username,
                Role: (int)user.Role,
                RegisteredAtUtc: user.RegisteredAtUtc,
                IsEmailVerified: user.IsEmailVerified,
                HasPhone: !string.IsNullOrEmpty(user.PhoneNumber),
                HasSocialLinks: !string.IsNullOrEmpty(user.SocialLinks),
                PositiveReviews: stats?.PositiveReviews ?? 0,
                NegativeReviews: stats?.NegativeReviews ?? 0,
                TotalRequests: stats?.TotalRequests ?? 0,
                CompletedRequests: stats?.CompletedRequests ?? 0
            ));
        }
    }
}
