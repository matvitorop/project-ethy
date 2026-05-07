using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ResolveComplaint
{
    public record ResolveComplaintCommand(Guid ComplaintId, string? AdminComment)
    : IRequest<Result<bool>>;
}
