using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.VerifyEmail
{
    public class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, Result<bool>>
    {
        private readonly IEmailVerificationTokenRepository _tokens;
        private readonly IUserRepository _users;

        public VerifyEmailHandler(
            IEmailVerificationTokenRepository tokens,
            IUserRepository users)
        {
            _tokens = tokens;
            _users = users;
        }

        public async Task<Result<bool>> Handle(
            VerifyEmailCommand request,
            CancellationToken ct)
        {
            var token = await _tokens.GetByTokenAsync(request.Token, ct);

            if (token is null || !token.IsValid())
                return Result<bool>.Failure(new Error(
                    "Invalid or expired token",
                    "Email.INVALID_TOKEN"));

            var user = await _users.GetByIdAsync(token.UserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            token.MarkAsUsed();
            await _tokens.MarkAsUsedAsync(token.Id, ct);

            user.VerifyEmail();
            await _users.VerifyEmailAsync(user.Id, ct);

            return Result<bool>.Success(true);
        }
    }
}
