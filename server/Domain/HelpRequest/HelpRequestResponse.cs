using server.Domain.Exceptions;

namespace server.Domain.HelpRequest
{
    public enum HelpRequestResponseStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2,
        Cancelled = 3
    }
    public class HelpRequestResponse
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }

        public HelpRequestResponseStatus Status { get; private set; }

        public DateTime CreatedAtUtc { get; private set; }

        public string Message { get; private set; }

        private HelpRequestResponse() { }

        public HelpRequestResponse(Guid userId, string message)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Status = HelpRequestResponseStatus.Pending;
            CreatedAtUtc = DateTime.UtcNow;
            Message = message;
        }

        internal void Accept()
        {
            if (Status != HelpRequestResponseStatus.Pending)
                throw new DomainException("Response already processed", "HelpRequestResponse.ALREADY_PROCESSED");

            Status = HelpRequestResponseStatus.Accepted;
        }

        internal void Reject()
        {
            if (Status != HelpRequestResponseStatus.Pending)
                return;

            Status = HelpRequestResponseStatus.Rejected;
        }

        internal void Cancel()
        {
            if (Status != HelpRequestResponseStatus.Pending)
                throw new DomainException("Cannot cancel processed response", "HelpRequestResponse.CANNOT_CANCEL");

            Status = HelpRequestResponseStatus.Cancelled;
        }
    }
}
