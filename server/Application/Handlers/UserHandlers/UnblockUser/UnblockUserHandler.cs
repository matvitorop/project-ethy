using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UnblockUser
{
    public class UnblockUserHandler : IRequestHandler<UnblockUserCommand, Result<bool>>
    {
        private readonly IUserRepository _users;

        public UnblockUserHandler(IUserRepository users) => _users = users;

        public async Task<Result<bool>> Handle(UnblockUserCommand request, CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.TargetUserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            user.Unblock();
            await _users.UnblockAsync(user.Id, ct);
            return Result<bool>.Success(true);
        }
    }
}
