using MediatR;

namespace server.Application.Events
{
    public sealed record HelpRequestAssignedEvent(
        Guid HelpRequestId,
        string HelpRequestTitle,
        Guid ExecutorId) : INotification;
}
