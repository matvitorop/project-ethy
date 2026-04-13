namespace server.Domain.Chat
{
    public class Chat
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid OwnerId { get; private set; }
        public Guid AssigneeId { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private Chat() { }

        public Chat(Guid helpRequestId, Guid ownerId, Guid assigneeId)
        {
            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            OwnerId = ownerId;
            AssigneeId = assigneeId;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
