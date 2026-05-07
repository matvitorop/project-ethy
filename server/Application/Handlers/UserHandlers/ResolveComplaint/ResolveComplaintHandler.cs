using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ResolveComplaint
{
    public class ResolveComplaintHandler
        : IRequestHandler<ResolveComplaintCommand, Result<bool>>
    {
        private readonly IComplaintRepository _complaints;
        public ResolveComplaintHandler(IComplaintRepository complaints) => _complaints = complaints;

        public async Task<Result<bool>> Handle(
            ResolveComplaintCommand request, CancellationToken ct)
        {
            var ok = await _complaints.MarkAsResolvedAsync(
                request.ComplaintId, request.AdminComment, ct);
            return ok
                ? Result<bool>.Success(true)
                : Result<bool>.Failure(new Error("Complaint not found", "Complaint.NOT_FOUND"));
        }
    }
}
