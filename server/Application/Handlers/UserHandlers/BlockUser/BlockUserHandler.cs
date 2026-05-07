using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Primitives;
using server.Domain.UserAndVolunteer;

namespace server.Application.Handlers.UserHandlers.BlockUser
{
    public class BlockUserHandler : IRequestHandler<BlockUserCommand, Result<bool>>
    {
        private readonly IUserRepository _users;
        private readonly IBlockHistoryRepository _blockHistory;
        private readonly IEmailSender _emailSender;

        public BlockUserHandler(
            IUserRepository users,
            IBlockHistoryRepository blockHistory,
            IEmailSender emailSender)
        {
            _users = users;
            _blockHistory = blockHistory;
            _emailSender = emailSender;
        }

        public async Task<Result<bool>> Handle(BlockUserCommand request, CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.TargetUserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            if (user.IsBlocked)
                return Result<bool>.Failure(new Error(
                    "User is already blocked",
                    "User.ALREADY_BLOCKED"));

            user.Block(request.BlockedUntilUtc, request.Reason);
            await _users.BlockAsync(user.Id, user.BlockedUntilUtc, user.BlockReason!, ct);

            await _blockHistory.AddAsync(new UserBlockRecord(
                userId: user.Id,
                adminId: request.AdminId,
                reason: request.Reason,
                blockedUntilUtc: request.BlockedUntilUtc), ct);

            try
            {
                await _emailSender.SendBlockNotificationAsync(
                    user.Email, user.Username, request.Reason, request.BlockedUntilUtc);
            }
            catch { }

            return Result<bool>.Success(true);
        }
    }
}
