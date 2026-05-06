using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ResolveComplaint
{
    public record ResolveComplaintCommand(Guid ComplaintId) : IRequest<Result<bool>>;
}
