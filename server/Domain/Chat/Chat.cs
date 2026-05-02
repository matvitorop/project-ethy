namespace server.Domain.Chat
{
    public class Chat
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid OwnerId { get; private set; }
        public Guid AssigneeId { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }
        public bool IsActive { get; private set; } = true;
        private Chat() { }
        internal Chat(
            Guid id,
            Guid helpRequestId,
            Guid ownerId,
            Guid assigneeId,
            DateTime createdAtUtc,
            bool isActive)
        {
            Id = id;
            HelpRequestId = helpRequestId;
            OwnerId = ownerId;
            AssigneeId = assigneeId;
            CreatedAtUtc = createdAtUtc;
            IsActive = isActive;
        }
        public Chat(Guid helpRequestId, Guid ownerId, Guid assigneeId)
        {
            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            OwnerId = ownerId;
            AssigneeId = assigneeId;
            CreatedAtUtc = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
