using server.Application.IServices;
using System.Text;
using System.Text.Json;

namespace server.Infrastructure
{
    public class ResendEmailSender : IEmailSender
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _frontendBaseUrl;
        private readonly HttpClient _httpClient;

        public ResendEmailSender(IConfiguration config, HttpClient httpClient)
        {
            _apiKey = config["Resend:ApiKey"]!;
            _fromEmail = config["Resend:FromEmail"] ?? "onboarding@resend.dev";
            _fromName = config["Resend:FromName"] ?? "Ethy";
            _frontendBaseUrl = config["Smtp:FrontendBaseUrl"]!;
            _httpClient = httpClient;
        }

        public Task SendEmailVerificationAsync(string toEmail, string username, string verificationLink)
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

        public Task SendVolunteerApplicationResultAsync(string toEmail, string username, bool approved, string? comment)
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

        public Task SendBlockNotificationAsync(string toEmail, string username, string reason, DateTime? blockedUntil)
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
            var payload = new
            {
                from = $"{_fromName} <{_fromEmail}>",
                to = new[] { toEmail },
                subject,
                html
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}
