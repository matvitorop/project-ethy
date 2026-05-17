using SendGrid;
using SendGrid.Helpers.Mail;
using server.Application.IServices;

namespace server.Infrastructure
{
    public class SendGridEmailSender : IEmailSender
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _frontendBaseUrl;

        public SendGridEmailSender(IConfiguration config)
        {
            _apiKey = config["SendGrid:ApiKey"]!;
            _fromEmail = config["SendGrid:FromEmail"]!;
            _fromName = config["SendGrid:FromName"] ?? "Ethy";
            _frontendBaseUrl = config["SendGrid:FrontendBaseUrl"] ?? "http://localhost:5173";
        }

        public async Task SendEmailVerificationAsync(
            string toEmail, string username, string verificationLink)
        {
            var subject = "Підтвердження електронної пошти — Ethy";
            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#0B1D3A">Вітаємо, {username}!</h2>
                  <p>Дякуємо за реєстрацію на платформі <strong>Ethy</strong>.</p>
                  <p>Для підтвердження електронної пошти натисніть кнопку нижче:</p>
                  <a href="{verificationLink}"
                     style="display:inline-block;padding:12px 24px;background:#0B1D3A;
                            color:#FEC130;border-radius:8px;text-decoration:none;
                            font-weight:600;margin:16px 0">
                    Підтвердити пошту
                  </a>
                  <p style="color:#666;font-size:12px">
                    Посилання дійсне 24 години. Якщо ви не реєструвались — проігноруйте цей лист.
                  </p>
                </div>
                """;

            await SendAsync(toEmail, subject, html);
        }

        public async Task SendVolunteerApplicationResultAsync(
            string toEmail, string username, bool approved, string? comment)
        {
            var subject = approved
                ? "Заявку на волонтера схвалено — Ethy"
                : "Заявку на волонтера відхилено — Ethy";

            var statusText = approved
                ? "<span style='color:#22C55E;font-weight:600'>✓ Схвалено</span>"
                : "<span style='color:#EF4444;font-weight:600'>✗ Відхилено</span>";

            var commentBlock = comment is not null
                ? $"<p><strong>Коментар адміністратора:</strong> {comment}</p>"
                : "";

            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#0B1D3A">Результат розгляду заявки</h2>
                  <p>Вітаємо, {username}!</p>
                  <p>Ваша заявка на отримання статусу волонтера: {statusText}</p>
                  {commentBlock}
                  <a href="{_frontendBaseUrl}/profile"
                     style="display:inline-block;padding:12px 24px;background:#0B1D3A;
                            color:#FEC130;border-radius:8px;text-decoration:none;font-weight:600">
                    Переглянути профіль
                  </a>
                </div>
                """;

            await SendAsync(toEmail, subject, html);
        }

        public async Task SendBlockNotificationAsync(
            string toEmail, string username, string reason, DateTime? blockedUntil)
        {
            var subject = "Ваш обліковий запис заблоковано — Ethy";
            var untilText = blockedUntil.HasValue && blockedUntil != DateTime.MaxValue
                ? $"до {blockedUntil.Value:dd.MM.yyyy HH:mm} UTC"
                : "безстроково";

            var html = $"""
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#EF4444">Обліковий запис заблоковано</h2>
                  <p>Вітаємо, {username}.</p>
                  <p>Ваш обліковий запис на платформі <strong>Ethy</strong> 
                     заблоковано <strong>{untilText}</strong>.</p>
                  <p><strong>Причина:</strong> {reason}</p>
                  <p style="color:#666;font-size:12px">
                    Якщо ви вважаєте це помилкою — зверніться до підтримки.
                  </p>
                </div>
                """;

            await SendAsync(toEmail, subject, html);
        }

        private async Task SendAsync(string toEmail, string subject, string html)
        {
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(toEmail);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, html);

            var response = await client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                throw new Exception($"SendGrid error {response.StatusCode}: {body}");
            }
        }
    }
}
