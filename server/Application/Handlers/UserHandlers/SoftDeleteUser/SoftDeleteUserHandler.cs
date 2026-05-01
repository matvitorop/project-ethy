using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.SoftDeleteUser
{
    public sealed class SoftDeleteUserHandler
        : IRequestHandler<SoftDeleteUserCommand, Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IHelpRequestRepository _helpRequestRepository;

        public SoftDeleteUserHandler(
            IUserRepository userRepository,
            IHelpRequestRepository helpRequestRepository)
        {
            _userRepository = userRepository;
            _helpRequestRepository = helpRequestRepository;
        }

        public async Task<Result> Handle(
            SoftDeleteUserCommand request,
            CancellationToken ct)
        {
            var user = await _userRepository.GetByIdAsync(request.TargetUserId, ct);

            if (user is null)
                return Result.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            // Тільки сам користувач або адмін
            var isSelf = request.TargetUserId == request.CurrentUserId;
            var isAdmin = await _userRepository.IsAdminAsync(request.CurrentUserId, ct);

            if (!isSelf && !isAdmin)
                return Result.Failure(
                    new Error("Access denied", "User.FORBIDDEN"));

            // Перевіряємо активні заявки як власник
            var hasActiveAsOwner = await _helpRequestRepository
                .HasActiveRequestsAsOwnerAsync(request.TargetUserId, ct);

            if (hasActiveAsOwner)
                return Result.Failure(
                    new Error(
                        "Close all active help requests before deleting account",
                        "User.HAS_ACTIVE_REQUESTS_AS_OWNER"));

            // Перевіряємо активні заявки як виконавець
            var hasActiveAsAssignee = await _helpRequestRepository
                .HasActiveRequestsAsAssigneeAsync(request.TargetUserId, ct);

            if (hasActiveAsAssignee)
                return Result.Failure(
                    new Error(
                        "You are assigned as executor in active requests. Please resolve them first",
                        "User.HAS_ACTIVE_REQUESTS_AS_ASSIGNEE"));

            try
            {
                user.SoftDelete(request.CurrentUserId);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }

            await _userRepository.SoftDeleteAsync(user, ct);

            return Result.Success();
        }
    }
}
