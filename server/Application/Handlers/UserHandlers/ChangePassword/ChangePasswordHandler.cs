using MediatR;
using server.Application.IRepositories;
using server.Application.Services;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ChangePassword
{
    public sealed class ChangePasswordHandler
        : IRequestHandler<ChangePasswordCommand, Result>
    {
        private readonly IUserRepository _repository;
        private readonly IPasswordHasher _passwordHasher;

        public ChangePasswordHandler(
            IUserRepository repository,
            IPasswordHasher passwordHasher)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
        }

        public async Task<Result> Handle(
            ChangePasswordCommand request,
            CancellationToken ct)
        {
            if (request.NewPassword != request.ConfirmNewPassword)
                return Result.Failure(
                    new Error(
                        "Passwords do not match",
                        "User.PASSWORDS_DO_NOT_MATCH"));

            var user = await _repository.GetByIdAsync(request.UserId, ct);

            if (user is null)
                return Result.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            // Верифікуємо старий пароль
            if (!_passwordHasher.Verify(
                request.OldPassword,
                user.PasswordHash,
                user.PasswordSalt))
                return Result.Failure(
                    new Error(
                        "Old password is incorrect",
                        "User.INVALID_OLD_PASSWORD"));

            try
            {
                var (hash, salt) = _passwordHasher.Hash(request.NewPassword);
                user.UpdatePassword(hash, salt);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _repository.UpdatePasswordAsync(
                user.Id,
                user.PasswordHash,
                user.PasswordSalt,
                ct);

            return Result.Success();
        }
    }
}
