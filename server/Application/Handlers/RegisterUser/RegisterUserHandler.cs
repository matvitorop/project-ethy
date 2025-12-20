using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain;

namespace server.Application.Handlers.RegisterUser
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, string>
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

        public async Task<string> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
                throw new Exception("User already exists");

            var (hash, salt) = _passwordHasher.Hash(request.Password);

            var user = new User(
                request.Username,
                request.Email,
                hash,
                salt,
                UserRole.User
            );

            await _userRepository.AddAsync(user);

            return _tokenService.GenerateAccessToken(user);
        }
    }
}
