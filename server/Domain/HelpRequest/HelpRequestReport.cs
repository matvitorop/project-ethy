using server.Domain.Exceptions;

namespace server.Domain.HelpRequest
{
    public class HelpRequestReport
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid CreatedByUserId { get; private set; }
        public string Comment { get; private set; }
        public string? ImageUrl { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private HelpRequestReport() { }

        public HelpRequestReport(
            Guid helpRequestId,
            Guid createdByUserId,
            string comment,
            string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(comment))
                throw new DomainException(
                    "Comment is required",
                    "HelpRequestReport.COMMENT_REQUIRED");

            if (comment.Length > 2000)
                throw new DomainException(
                    "Comment is too long",
                    "HelpRequestReport.COMMENT_TOO_LONG");

            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            CreatedByUserId = createdByUserId;
            Comment = comment;
            ImageUrl = imageUrl;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
