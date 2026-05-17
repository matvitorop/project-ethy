using MimeKit;
using server.Application.IServices;
using MailKit.Net.Smtp;

namespace server.Infrastructure
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly string _host;
        private readonly int _port;
        private readonly string _username;
        private readonly string _password;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _frontendBaseUrl;

        public SmtpEmailSender(IConfiguration config)
        {
            _host = config["Smtp:Host"]!;
            _port = int.Parse(config["Smtp:Port"]!);
            _username = config["Smtp:Username"]!;
            _password = config["Smtp:Password"]!;
            _fromEmail = config["Smtp:FromEmail"]!;
            _fromName = config["Smtp:FromName"] ?? "Ethy";
            _frontendBaseUrl = config["Smtp:FrontendBaseUrl"] ?? throw new InvalidOperationException("Smtp:FrontendBaseUrl is not configured");
        }

        public Task SendEmailVerificationAsync(
            string toEmail, string username, string verificationLink)
        {
            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#0B1D3A">Вітаємо, {username}!</h2>
                  <p>Для підтвердження електронної пошти натисніть кнопку нижче:</p>
                  <a href="{verificationLink}"
                     style="display:inline-block;padding:12px 24px;background:#0B1D3A;
                            color:#FEC130;border-radius:8px;text-decoration:none;font-weight:600">
                    Підтвердити пошту
                  </a>
                  <p style="color:#666;font-size:12px">Посилання дійсне 24 години.</p>
                </div>
                """;
            return SendAsync(toEmail, "Підтвердження пошти — Ethy", html);
        }

        public Task SendVolunteerApplicationResultAsync(
            string toEmail, string username, bool approved, string? comment)
        {
            var status = approved
                ? "<span style='color:#22C55E;font-weight:600'>✓ Схвалено</span>"
                : "<span style='color:#EF4444;font-weight:600'>✗ Відхилено</span>";
            var commentBlock = comment is not null
                ? $"<p><strong>Коментар:</strong> {comment}</p>" : "";
            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#0B1D3A">Результат заявки на волонтера</h2>
                  <p>Вітаємо, {username}! Ваша заявка: {status}</p>
                  {commentBlock}
                </div>
                """;
            return SendAsync(toEmail,
                approved ? "Заявку схвалено — Ethy" : "Заявку відхилено — Ethy", html);
        }

        public Task SendBlockNotificationAsync(
            string toEmail, string username, string reason, DateTime? blockedUntil)
        {
            var until = blockedUntil.HasValue && blockedUntil != DateTime.MaxValue
                ? $"до {blockedUntil.Value:dd.MM.yyyy HH:mm}" : "безстроково";
            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#EF4444">Обліковий запис заблоковано</h2>
                  <p>{username}, ваш акаунт заблоковано <strong>{until}</strong>.</p>
                  <p><strong>Причина:</strong> {reason}</p>
                </div>
                """;
            return SendAsync(toEmail, "Акаунт заблоковано — Ethy", html);
        }

        private async Task SendAsync(string toEmail, string subject, string html)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = html };

            using var client = new SmtpClient();
            await client.ConnectAsync(_host, _port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_username, _password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
