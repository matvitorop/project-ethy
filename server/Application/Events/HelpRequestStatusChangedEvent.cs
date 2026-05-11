using MediatR;
using server.Domain.HelpRequest;

namespace server.Application.Events
{
    public sealed record HelpRequestStatusChangedEvent(
        Guid HelpRequestId,
        string HelpRequestTitle,
        Guid? ParticipantId, // Person who should be notified (Executor or Owner)
        HelpRequestStatus NewStatus) : INotification;
}
