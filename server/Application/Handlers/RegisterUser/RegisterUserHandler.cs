using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain;
using server.Domain.Primitives;

namespace server.Application.Handlers.RegisterUser
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<string>>
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

        public async Task<Result<string>> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);

            if (existing != null)
            {
                return Result<string>.Failure(new Error(
                        "Wrong email or password. Please try again.",
                        "User.USER_ALREADY_EXISTS"
                    )
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

            return Result<string>.Success(token);
        }
    }
}
