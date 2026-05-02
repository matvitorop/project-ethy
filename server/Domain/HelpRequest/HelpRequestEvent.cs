namespace server.Domain.HelpRequest
{
    public enum HelpRequestEventType
    {
        ExecutorAssigned = 0,
        StatusChanged = 1,
        StageProposed = 2,
        StageConfirmed = 3,
        StageRejected = 4,
        StageDeleted = 5,
        HelpRequestEdited = 6,
        ExecutorResigned = 7,
        ExecutorRemoved = 8
    }

    public class HelpRequestEvent
    {
        public Guid Id { get; private set; }
        public Guid HelpRequestId { get; private set; }
        public Guid ActorId { get; private set; }
        public HelpRequestEventType EventType { get; private set; }
        public string Payload { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private HelpRequestEvent() { }

        public HelpRequestEvent(Guid helpRequestId, Guid actorId, HelpRequestEventType eventType, string payload)
        {
            Id = Guid.NewGuid();
            HelpRequestId = helpRequestId;
            ActorId = actorId;
            EventType = eventType;
            Payload = payload;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
