namespace server.Domain.UserAndVolunteer
{
    public enum VolunteerApplicationStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class VolunteerApplication
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string OrganizationName { get; private set; }
        public string ActivityDescription { get; private set; }
        public string? DocumentImageUrl { get; private set; }
        public VolunteerApplicationStatus Status { get; private set; }
        public string? AdminComment { get; private set; }
        public DateTime SubmittedAtUtc { get; private set; }
        public DateTime? ReviewedAtUtc { get; private set; }
        public Guid? ReviewedByAdminId { get; private set; }

        private VolunteerApplication() { }

        public VolunteerApplication(
            Guid userId,
            string organizationName,
            string activityDescription,
            string? documentImageUrl)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            OrganizationName = organizationName;
            ActivityDescription = activityDescription;
            DocumentImageUrl = documentImageUrl;
            Status = VolunteerApplicationStatus.Pending;
            SubmittedAtUtc = DateTime.UtcNow;
        }

        public void Approve(Guid adminId, string? comment)
        {
            Status = VolunteerApplicationStatus.Approved;
            AdminComment = comment;
            ReviewedAtUtc = DateTime.UtcNow;
            ReviewedByAdminId = adminId;
        }

        public void Reject(Guid adminId, string? comment)
        {
            Status = VolunteerApplicationStatus.Rejected;
            AdminComment = comment;
            ReviewedAtUtc = DateTime.UtcNow;
            ReviewedByAdminId = adminId;
        }
    }
}
