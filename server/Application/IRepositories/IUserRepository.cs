using server.Application.Handlers.GetUserStatistics;
using server.Domain;

namespace server.Application.IRepositories
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> AddAsync(User user);
        Task<UserStatisticsDto?> GetUserStatisticsAsync(Guid userId, CancellationToken ct);
        Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
        Task UpdateUsernameAsync(Guid id, string username, CancellationToken ct);
        Task UpdatePasswordAsync(Guid id, string passwordHash, string passwordSalt, CancellationToken ct);
        Task<bool> IsAdminAsync(Guid userId, CancellationToken ct);
        Task SoftDeleteAsync(User user, CancellationToken ct);
        
        // Trust module
        Task UpdateProfileAsync(Guid id, string? phoneNumber, string? socialLinks, CancellationToken ct);
        // ---

        // Admin module
        Task VerifyEmailAsync(Guid userId, CancellationToken ct);
        Task UpdateLastVolunteerApplicationDateAsync(Guid userId, CancellationToken ct);
        Task UpdateRoleAsync(Guid userId, UserRole role, CancellationToken ct);
        Task BlockAsync(Guid userId, DateTime? blockedUntilUtc, string reason, CancellationToken ct);
        Task UnblockAsync(Guid userId, CancellationToken ct);
        // ---

    }
}
