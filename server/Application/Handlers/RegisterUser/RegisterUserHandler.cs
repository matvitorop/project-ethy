using server.Application.IRepositories;
using server.Application.Services;
using server.Domain;

namespace server.Application.Handlers.RegisterUser
{
    public class RegisterUserHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public RegisterUserHandler(
        IUserRepository users,
        IPasswordHasher hasher)
        {
            _userRepository = users;
            _passwordHasher = hasher;
        }

        public async Task<Guid> Handle(
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

            return user.Id;
        }
    }
}
