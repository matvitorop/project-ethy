using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Primitives;
using server.Domain.UserAndVolunteer;

namespace server.Application.Handlers.UserHandlers.SendVerificationEmail
{
    public class SendVerificationEmailHandler
        : IRequestHandler<SendVerificationEmailCommand, Result<bool>>
    {
        private readonly IUserRepository _users;
        private readonly IEmailVerificationTokenRepository _tokens;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;

        public SendVerificationEmailHandler(
            IUserRepository users,
            IEmailVerificationTokenRepository tokens,
            IEmailSender emailSender,
            IConfiguration config)
        {
            _users = users;
            _tokens = tokens;
            _emailSender = emailSender;
            _config = config;
        }

        public async Task<Result<bool>> Handle(
            SendVerificationEmailCommand request,
            CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.UserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            if (user.IsEmailVerified)
                return Result<bool>.Failure(new Error("Email already verified", "Email.ALREADY_VERIFIED"));

            // Перевіряємо що попередній токен не активний (не спамимо)
            var lastToken = await _tokens.GetLatestByUserIdAsync(request.UserId, ct);
            if (lastToken is not null && lastToken.CreatedAtUtc > DateTime.UtcNow.AddMinutes(-5))
                return Result<bool>.Failure(new Error(
                    "Please wait before requesting another email",
                    "Email.TOO_MANY_REQUESTS"));

            var token = new EmailVerificationToken(request.UserId);
            await _tokens.AddAsync(token, ct);

            var frontendUrl = _config["Smtp:FrontendBaseUrl"] ?? throw new InvalidOperationException("Smtp:FrontendBaseUrl is not configured");
            var link = $"{frontendUrl}/verify-email?token={token.Token}";

            await _emailSender.SendEmailVerificationAsync(user.Email, user.Username, link);

            return Result<bool>.Success(true);
        }
    }
}
