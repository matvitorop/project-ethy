using System;

namespace server.Application.Handlers.AdminHandlers.AdminGetUsers
{
    public sealed record AdminUserDto(
        Guid Id,
        string Username,
        string Email,
        int Role,
        DateTime RegisteredAtUtc,
        bool IsBlocked,
        DateTime? BlockedUntilUtc,
        bool IsDeleted,
        DateTime? LastActivityAtUtc
    );
}
