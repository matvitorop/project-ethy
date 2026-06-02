namespace server.Domain.ReviewAndComplaints
{
    public class UserComplaint
    {
        public Guid Id { get; init; }
        public Guid ReporterUserId { get; init; }
        public Guid TargetUserId { get; init; }
        public string Reason { get; init; } = null!;
        public DateTime CreatedAtUtc { get; init; }

        private UserComplaint() { }

        public UserComplaint(Guid reporterUserId, Guid targetUserId, string reason)
        {
            Id = Guid.NewGuid();
            ReporterUserId = reporterUserId;
            TargetUserId = targetUserId;
            Reason = reason;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }

}
