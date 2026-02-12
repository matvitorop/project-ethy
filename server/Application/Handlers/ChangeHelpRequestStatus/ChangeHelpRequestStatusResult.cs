using server.Domain.HelpRequest;

namespace server.Application.Handlers.ChangeHelpRequestStatus
{
    public sealed record ChangeHelpRequestStatusResult(
        Guid Id,
        HelpRequestStatus Status
    );
}
