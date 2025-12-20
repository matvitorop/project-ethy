using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain;

namespace server.Application.Handlers.RegisterUser
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, RegisterUserResult>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public RegisterUserHandler(
        IUserRepository users,
        IPasswordHasher hasher, 
        ITokenService tokenService)
        {
            _userRepository = users;
            _passwordHasher = hasher;
            _tokenService = tokenService;
        }

        public async Task<RegisterUserResult> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);

            if (existing != null)
            {
                return new RegisterUserResult(
                    Success: false,
                    Token: null,
                    ErrorCode: "USER_EXISTS",
                    ErrorMessage: "User with this email already exists"
                );
            }

            var (hash, salt) = _passwordHasher.Hash(request.Password);

            var user = new User(
                request.Username,
                request.Email,
                hash,
                salt,
                UserRole.User
            );

            await _userRepository.AddAsync(user);

            var token = _tokenService.GenerateAccessToken(user);

            return new RegisterUserResult(
                Success: true,
                Token: token,
                ErrorCode: null,
                ErrorMessage: null
            );
        }
    }
}
