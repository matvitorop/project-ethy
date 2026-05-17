using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UpdateProfile
{
    public sealed class UpdateProfileHandler
    : IRequestHandler<UpdateProfileCommand, Result>
    {
        private readonly IUserRepository _userRepository;

        public UpdateProfileHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Result> Handle(
            UpdateProfileCommand request,
            CancellationToken ct)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, ct);

            if (user is null)
                return Result.Failure(new Error("User not found", "User.NOT_FOUND"));

            try
            {
                user.UpdateProfile(request.PhoneNumber, request.SocialLinks);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _userRepository.UpdateProfileAsync(
                request.UserId,
                user.PhoneNumber,
                user.SocialLinks,
                ct);

            return Result.Success();
        }
    }

}
