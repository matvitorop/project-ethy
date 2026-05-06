namespace server.Domain.UserAndVolunteer
{
    public class EmailVerificationToken
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Token { get; private set; }
        public DateTime ExpiresAtUtc { get; private set; }
        public bool IsUsed { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private EmailVerificationToken() { }

        public EmailVerificationToken(Guid userId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                        .Replace("+", "-").Replace("/", "_").Replace("=", "");
            ExpiresAtUtc = DateTime.UtcNow.AddHours(24);
            IsUsed = false;
            CreatedAtUtc = DateTime.UtcNow;
        }

        public bool IsValid() => !IsUsed && ExpiresAtUtc > DateTime.UtcNow;

        public void MarkAsUsed() => IsUsed = true;
    }
}
