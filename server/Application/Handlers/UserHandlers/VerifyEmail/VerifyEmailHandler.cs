using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.VerifyEmail
{
    public class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, Result<string>>
    {
        private readonly IEmailVerificationTokenRepository _tokens;
        private readonly IUserRepository _users;
        private readonly ITokenService _tokenService;

        public VerifyEmailHandler(
            IEmailVerificationTokenRepository tokens,
            IUserRepository users,
            ITokenService tokenService)
        {
            _tokens = tokens;
            _users = users;
            _tokenService = tokenService;
        }

        public async Task<Result<string>> Handle(
            VerifyEmailCommand request,
            CancellationToken ct)
        {
            var token = await _tokens.GetByTokenAsync(request.Token, ct);

            if (token is null || !token.IsValid())
                return Result<string>.Failure(new Error(
                    "Invalid or expired token",
                    "Email.INVALID_TOKEN"));

            var user = await _users.GetByIdAsync(token.UserId, ct);
            if (user is null)
                return Result<string>.Failure(new Error("User not found", "User.NOT_FOUND"));

            token.MarkAsUsed();
            await _tokens.MarkAsUsedAsync(token.Id, ct);

            user.VerifyEmail();
            await _users.VerifyEmailAsync(user.Id, ct);

            var tokenString = _tokenService.GenerateAccessToken(user);

            return Result<string>.Success(tokenString);
        }
    }
}
