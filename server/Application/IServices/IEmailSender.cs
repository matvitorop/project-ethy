namespace server.Application.IServices
{
    public interface IEmailSender
    {
        Task SendEmailVerificationAsync(string toEmail, string username, string verificationLink);
        Task SendVolunteerApplicationResultAsync(string toEmail, string username, bool approved, string? comment);
        Task SendBlockNotificationAsync(string toEmail, string username, string reason, DateTime? blockedUntil);
    }
}
