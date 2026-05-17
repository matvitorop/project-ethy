namespace server.Domain.UserAndVolunteer
{
    public class UserBlockRecord
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid AdminId { get; private set; }
        public string Reason { get; private set; }
        public DateTime? BlockedUntilUtc { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private UserBlockRecord() { }

        public UserBlockRecord(Guid userId, Guid adminId, string reason, DateTime? blockedUntilUtc)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            AdminId = adminId;
            Reason = reason;
            BlockedUntilUtc = blockedUntilUtc;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
