using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UpdateUsername
{
    public sealed class UpdateUsernameHandler
        : IRequestHandler<UpdateUsernameCommand, Result>
    {
        private readonly IUserRepository _repository;

        public UpdateUsernameHandler(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(
            UpdateUsernameCommand request,
            CancellationToken ct)
        {
            var user = await _repository.GetByIdAsync(request.UserId, ct);

            if (user is null)
                return Result.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            try
            {
                user.UpdateUsername(request.NewUsername);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _repository.UpdateUsernameAsync(user.Id, user.Username, ct);

            return Result.Success();
        }
    }
}
