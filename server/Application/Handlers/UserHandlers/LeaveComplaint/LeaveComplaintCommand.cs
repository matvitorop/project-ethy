using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.LeaveComplaint
{
    public sealed record LeaveComplaintCommand(
        Guid ReporterUserId,
        Guid TargetUserId,
        string Reason
    ) : IRequest<Result<Guid>>;

}
