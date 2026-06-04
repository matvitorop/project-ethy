using MediatR;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.UnblockUser
{
    public class UnblockUserHandler : IRequestHandler<UnblockUserCommand, Result<bool>>
    {
        private readonly IUserRepository _users;
        private readonly IMemoryCache _cache;

        public UnblockUserHandler(IUserRepository users, IMemoryCache cache)
        {
            _users = users;
            _cache = cache;
        }

        public async Task<Result<bool>> Handle(UnblockUserCommand request, CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.TargetUserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            user.Unblock();
            await _users.UnblockAsync(user.Id, ct);
            _cache.Remove($"user_blocked_{user.Id}");
            return Result<bool>.Success(true);
        }
    }
}
