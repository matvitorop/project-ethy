using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetProfile
{
    public sealed class GetProfileHandler
        : IRequestHandler<GetProfileQuery, Result<ProfileDto>>
    {
        private readonly IUserRepository _repository;

        public GetProfileHandler(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<ProfileDto>> Handle(
            GetProfileQuery request,
            CancellationToken ct)
        {
            var user = await _repository.GetByIdAsync(request.UserId, ct);

            if (user is null)
                return Result<ProfileDto>.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            return Result<ProfileDto>.Success(
                new ProfileDto(
                    user.Id,
                    user.Username,
                    user.Email,
                    user.RegisteredAtUtc,
                    user.PhoneNumber,
                    user.SocialLinks,
                    user.IsEmailVerified,
                    user.Role.ToString()));
        }
    }
}
