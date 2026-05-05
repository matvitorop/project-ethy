using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;
using server.Domain.ReviewAndComplaints;

namespace server.Application.Handlers.UserHandlers.LeaveComplaint
{
    public sealed class LeaveComplaintHandler
    : IRequestHandler<LeaveComplaintCommand, Result<Guid>>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IUserRepository _userRepository;

        public LeaveComplaintHandler(
            IComplaintRepository complaintRepository,
            IUserRepository userRepository)
        {
            _complaintRepository = complaintRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<Guid>> Handle(
            LeaveComplaintCommand request,
            CancellationToken ct)
        {
            if (request.ReporterUserId == request.TargetUserId)
                return Result<Guid>.Failure(
                    new Error("Cannot complain about yourself", "Complaint.SELF_REPORT"));

            var target = await _userRepository.GetByIdAsync(request.TargetUserId, ct);

            if (target is null)
                return Result<Guid>.Failure(
                    new Error("Target user not found", "User.NOT_FOUND"));

            if (string.IsNullOrWhiteSpace(request.Reason))
                return Result<Guid>.Failure(
                    new Error("Reason is required", "Complaint.REASON_REQUIRED"));

            var complaint = new UserComplaint(
                request.ReporterUserId,
                request.TargetUserId,
                request.Reason);

            await _complaintRepository.AddAsync(complaint, ct);

            return Result<Guid>.Success(complaint.Id);
        }
    }

}
