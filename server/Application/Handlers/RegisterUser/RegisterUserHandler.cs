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

        private static (bool IsValid, string ErrorMessage) ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return (false, "Пароль не може бути порожнім.");
            }

            if (password.Length < 8)
            {
                return (false, "Пароль має містити щонайменше 8 символів.");
            }

            bool hasUpper = false;
            bool hasLower = false;
            bool hasDigit = false;
            bool hasSpecial = false;

            string specialCh = @"%!@#$%^&*()_+=\[{\]};:<>|./?,-~`'""";

            foreach (char c in password)
            {
                if (char.IsUpper(c)) hasUpper = true;
                else if (char.IsLower(c)) hasLower = true;
                else if (char.IsDigit(c)) hasDigit = true;
                else if (specialCh.Contains(c) || char.IsSymbol(c) || char.IsPunctuation(c)) hasSpecial = true;
            }

            if (!hasUpper)
            {
                return (false, "Пароль має містити щонайменше одну велику літеру.");
            }

            if (!hasLower)
            {
                return (false, "Пароль має містити щонайменше одну малу літеру.");
            }

            if (!hasDigit)
            {
                return (false, "Пароль має містити щонайменше одну цифру.");
            }

            if (!hasSpecial)
            {
                return (false, "Пароль має містити щонайменше один спеціальний символ (наприклад, @, #, $, %).");
            }

            return (true, string.Empty);
        }

        public async Task<Result<string>> Handle(
            RegisterUserCommand request,
            CancellationToken cancellationToken)
        {
            var pwdValidation = ValidatePassword(request.Password);
            if (!pwdValidation.IsValid)
            {
                return Result<string>.Failure(new Error(
                    pwdValidation.ErrorMessage,
                    "User.INVALID_PASSWORD"));
            }

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
