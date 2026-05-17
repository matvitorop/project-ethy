using MediatR;

namespace server.Application.Events
{
    public sealed record ChatMessageSentEvent(
        Guid ChatId,
        Guid SenderId,
        Guid ReceiverId,
        string SenderUsername,
        string Content) : INotification;
}
