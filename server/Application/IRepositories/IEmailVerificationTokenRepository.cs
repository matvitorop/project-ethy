using server.Domain.UserAndVolunteer;

namespace server.Application.IRepositories
{
    public interface IEmailVerificationTokenRepository
    {
        Task AddAsync(EmailVerificationToken token, CancellationToken ct);
        Task<EmailVerificationToken?> GetByTokenAsync(string token, CancellationToken ct);
        Task<EmailVerificationToken?> GetLatestByUserIdAsync(Guid userId, CancellationToken ct);
        Task MarkAsUsedAsync(Guid tokenId, CancellationToken ct);
    }
}
