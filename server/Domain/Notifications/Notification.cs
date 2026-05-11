using server.Domain.Primitives;

namespace server.Domain.Notifications
{
    public enum NotificationType
    {
        Info = 0,
        Chat = 1,
        HelpRequest = 2,
        Volunteer = 3,
        Warning = 4
    }

    public sealed class Notification : Entity
    {
        public Guid UserId { get; private set; }
        public string Title { get; private set; }
        public string Content { get; private set; }
        public NotificationType Type { get; private set; }
        public bool IsRead { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }
        
        // Metadata for navigation
        public Guid? RelatedEntityId { get; private set; }
        public string? RelatedEntityType { get; private set; }

        private Notification() { }

        public Notification(
            Guid userId, 
            string title, 
            string content, 
            NotificationType type, 
            Guid? relatedEntityId = null, 
            string? relatedEntityType = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Title = title;
            Content = content;
            Type = type;
            CreatedAtUtc = DateTime.UtcNow;
            IsRead = false;
            RelatedEntityId = relatedEntityId;
            RelatedEntityType = relatedEntityType;
        }

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}
