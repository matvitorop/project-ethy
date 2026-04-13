using server.Domain.Exceptions;

namespace server.Domain.Chat
{
    public class ChatMessage
    {
        public Guid Id { get; private set; }
        public Guid ChatId { get; private set; }
        public Guid SenderId { get; private set; }
        public string Content { get; private set; }
        public DateTime CreatedAtUtc { get; private set; }

        private ChatMessage() { }

        public ChatMessage(Guid chatId, Guid senderId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new DomainException(
                    "Message content is required",
                    "ChatMessage.CONTENT_REQUIRED");

            if (content.Length > 2000)
                throw new DomainException(
                    "Message is too long",
                    "ChatMessage.CONTENT_TOO_LONG");

            Id = Guid.NewGuid();
            ChatId = chatId;
            SenderId = senderId;
            Content = content;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
