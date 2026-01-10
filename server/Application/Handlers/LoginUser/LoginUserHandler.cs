using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain.Primitives;

namespace server.Application.Handlers.LoginUser
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, Result<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public LoginUserHandler(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        public async Task<Result<string>> Handle(
            LoginUserCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user is null)
            {
                return Result<string>.Failure(new Error(
                    "Invalid email or password",
                    "INVALID_CREDENTIALS"));
            }

            var valid = _passwordHasher.Verify(
                request.Password,
                user.PasswordHash,
                user.PasswordSalt
            );

            if (!valid)
            {
                return Result<string>.Failure(new Error(
                    "Invalid email or password",
                    "INVALID_CREDENTIALS"));
            }

            var token = _tokenService.GenerateAccessToken(user);

            return Result<string>.Success(token);
        }
    }
}
