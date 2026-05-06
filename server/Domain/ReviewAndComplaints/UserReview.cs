namespace server.Domain.ReviewAndComplaints
{
    public class UserReview
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid ReviewerUserId { get; private set; }
        public Guid TargetUserId { get; private set; }
        public bool IsPositive { get; private set; }
        public string? Comment { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private UserReview() { }

        public UserReview(
            Guid helpRequestId,
            Guid reviewerUserId,
            Guid targetUserId,
            bool isPositive,
            string? comment)
        {
            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            ReviewerUserId = reviewerUserId;
            TargetUserId = targetUserId;
            IsPositive = isPositive;
            Comment = comment;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }

}
