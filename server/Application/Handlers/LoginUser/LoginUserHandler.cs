using MediatR;
using server.Application.IRepositories;
using server.Application.Services;

namespace server.Application.Handlers.LoginUser
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, LoginUserResult>
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

        public async Task<LoginUserResult> Handle(
            LoginUserCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user is null)
            {
                return Fail();
            }

            var valid = _passwordHasher.Verify(
                request.Password,
                user.PasswordHash,
                user.PasswordSalt
            );

            if (!valid)
            {
                return Fail();
            }

            var token = _tokenService.GenerateAccessToken(user);

            return new LoginUserResult(
                Success: true,
                Token: token,
                ErrorCode: null,
                ErrorMessage: null
            );
        }

        private static LoginUserResult Fail() =>
            new(
                Success: false,
                Token: null,
                ErrorCode: "INVALID_CREDENTIALS",
                ErrorMessage: "Invalid email or password"
            );
    }
}
