using MediatR;

namespace server.Application.Events
{
    public sealed record HelpRequestRespondedEvent(
        Guid HelpRequestId, 
        Guid CreatorId, 
        Guid ResponderId, 
        string Message) : INotification;
}
