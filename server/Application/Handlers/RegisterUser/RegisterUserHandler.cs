using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Application.Services;
using server.Domain;
using server.Domain.Primitives;
using server.Domain.UserAndVolunteer;

namespace server.Application.Handlers.RegisterUser
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailVerificationTokenRepository _tokenRepository;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;

        public RegisterUserHandler(
            IUserRepository users,
            IPasswordHasher hasher,
            IEmailVerificationTokenRepository tokenRepository,
            IEmailSender emailSender,
            IConfiguration config)
        {
            _userRepository = users;
            _passwordHasher = hasher;
            _tokenRepository = tokenRepository;
            _emailSender = emailSender;
            _config = config;
        }

        public async Task<Result<string>> Handle(
            RegisterUserCommand request,
            CancellationToken cancellationToken)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
                return Result<string>.Failure(new Error(
                    "Wrong email or password. Please try again.",
                    "User.USER_ALREADY_EXISTS"));

            var (hash, salt) = _passwordHasher.Hash(request.Password);
            var user = new User(request.Username, request.Email, hash, salt, UserRole.User);
            await _userRepository.AddAsync(user);

            // Генеруємо токен і надсилаємо лист
            var verificationToken = new EmailVerificationToken(user.Id);
            await _tokenRepository.AddAsync(verificationToken, cancellationToken);

            var frontendUrl = _config["Smtp:FrontendBaseUrl"] ?? throw new InvalidOperationException("Smtp:FrontendBaseUrl is not configured");
            var link = $"{frontendUrl}/verify-email?token={verificationToken.Token}";

            await _emailSender.SendEmailVerificationAsync(user.Email, user.Username, link);
            //try
            //{
            //    await _emailSender.SendEmailVerificationAsync(user.Email, user.Username, link);
            //}
            //catch
            //{
            //    // Email failure не блокує реєстрацію
            //}

            // Повертаємо порожній рядок — JWT не видається до верифікації
            return Result<string>.Success(string.Empty);
        }
    }
}
