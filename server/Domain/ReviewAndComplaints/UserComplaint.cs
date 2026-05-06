namespace server.Domain.ReviewAndComplaints
{
    public class UserComplaint
    {
        public Guid Id { get; private set; }
        public Guid ReporterUserId { get; private set; }
        public Guid TargetUserId { get; private set; }
        public string Reason { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

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
