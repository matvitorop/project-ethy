using server.Domain.Exceptions;

namespace server.Domain.HelpRequest
{
    public enum HelpRequestStageStatus
    {
        Proposed = 0,
        Confirmed = 1,
        Rejected = 2,
        Deleted = 3
    }

    public class HelpRequestStage
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid ChatId { get; private set; }
        public Guid ProposedByUserId { get; private set; }
        public string Content { get; private set; }
        public HelpRequestStageStatus Status { get; private set; }
        public string? RejectionReason { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }
        public DateTime? ResolvedAtUtc { get; private set; }

        private HelpRequestStage() { }

        //Public constructor for creating new stages
        public HelpRequestStage(Guid helpRequestId, Guid chatId, Guid proposedByUserId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new DomainException(
                    "Stage content is required",
                    "HelpRequestStage.CONTENT_REQUIRED");

            if (content.Length > 500)
                throw new DomainException(
                    "Stage content is too long",
                    "HelpRequestStage.CONTENT_TOO_LONG");

            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            ChatId = chatId;
            ProposedByUserId = proposedByUserId;
            Content = content;
            Status = HelpRequestStageStatus.Proposed;
            CreatedAtUtc = DateTime.UtcNow;
        }

        //Internal contructor for rehydrating from database
        internal HelpRequestStage(
            Guid id,
            Guid helpRequestId,
            Guid chatId,
            Guid proposedByUserId,
            string content,
            int status,
            string? rejectionReason,
            DateTime createdAtUtc,
            DateTime? resolvedAtUtc)
        {
            Id = id;
            HelpRequestId = helpRequestId;
            ChatId = chatId;
            ProposedByUserId = proposedByUserId;
            Content = content;
            Status = (HelpRequestStageStatus)status;
            RejectionReason = rejectionReason;
            CreatedAtUtc = createdAtUtc;
            ResolvedAtUtc = resolvedAtUtc;
        }

        //Automatic confirmed stage (for the first stage during AssignExecutor)
        public static HelpRequestStage CreateConfirmed(Guid helpRequestId, Guid chatId, Guid proposedByUserId, string content)
        {
            var stage = new HelpRequestStage(
                helpRequestId, chatId, proposedByUserId, content);

            stage.Status = HelpRequestStageStatus.Confirmed;
            stage.ResolvedAtUtc = DateTime.UtcNow;

            return stage;
        }

        public void Confirm(Guid userId)
        {
            if (Status != HelpRequestStageStatus.Proposed)
                throw new DomainException(
                    "Stage is not in proposed state",
                    "HelpRequestStage.NOT_PROPOSED");

            if (ProposedByUserId == userId)
                throw new DomainException(
                    "Cannot confirm own stage",
                    "HelpRequestStage.SELF_CONFIRM");

            Status = HelpRequestStageStatus.Confirmed;
            ResolvedAtUtc = DateTime.UtcNow;
        }

        public void Reject(Guid userId, string reason)
        {
            if (Status != HelpRequestStageStatus.Proposed)
                throw new DomainException(
                    "Stage is not in proposed state",
                    "HelpRequestStage.NOT_PROPOSED");

            if (ProposedByUserId == userId)
                throw new DomainException(
                    "Cannot reject own stage",
                    "HelpRequestStage.SELF_REJECT");

            if (string.IsNullOrWhiteSpace(reason))
                throw new DomainException(
                    "Rejection reason is required",
                    "HelpRequestStage.REJECTION_REASON_REQUIRED");

            if (reason.Length > 500)
                throw new DomainException(
                    "Rejection reason is too long",
                    "HelpRequestStage.REJECTION_REASON_TOO_LONG");

            Status = HelpRequestStageStatus.Rejected;
            RejectionReason = reason;
            ResolvedAtUtc = DateTime.UtcNow;
        }

        public void Delete(Guid userId)
        {
            if (Status != HelpRequestStageStatus.Proposed)
                throw new DomainException(
                    "Only proposed stages can be deleted",
                    "HelpRequestStage.NOT_PROPOSED");

            if (ProposedByUserId != userId)
                throw new DomainException(
                    "Cannot delete stage proposed by another user",
                    "HelpRequestStage.NOT_OWNER");

            Status = HelpRequestStageStatus.Deleted;
            ResolvedAtUtc = DateTime.UtcNow;
        }
    }
}