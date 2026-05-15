using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetProfile
{
    public sealed class GetProfileHandler
        : IRequestHandler<GetProfileQuery, Result<ProfileDto>>
    {
        private readonly IUserRepository _repository;
        private readonly IHelpRequestRepository _helpRequestRepository;
        private readonly IComplaintRepository _complaintRepository;

        public GetProfileHandler(IUserRepository repository, IHelpRequestRepository helpRequestRepository, IComplaintRepository complaintRepository)
        {
            _repository = repository;
            _helpRequestRepository = helpRequestRepository;
            _complaintRepository = complaintRepository;
        }

        public async Task<Result<ProfileDto>> Handle(
            GetProfileQuery request,
            CancellationToken ct)
        {
            var user = await _repository.GetByIdAsync(request.UserId, ct);

            if (user is null)
                return Result<ProfileDto>.Failure(
                    new Error("User not found", "User.NOT_FOUND"));

            var activeRequestsCount = await _helpRequestRepository.CountActiveRequestsByCreatorAsync(user.Id, ct);
            var activeResponsesCount = await _helpRequestRepository.CountActiveResponsesByUserAsync(user.Id, ct);
            var stats = await _repository.GetUserStatisticsAsync(user.Id, ct);
            var dailyComplaintsCount = await _complaintRepository.GetCountByUserInLast24HoursAsync(user.Id, ct);

            return Result<ProfileDto>.Success(
                new ProfileDto(
                    user.Id,
                    user.Username,
                    user.Email,
                    user.RegisteredAtUtc,
                    user.PhoneNumber,
                    user.SocialLinks,
                    user.IsEmailVerified,
                    user.Role.ToString(),
                    activeRequestsCount,
                    activeResponsesCount,
                    TotalRequests: stats?.TotalRequests ?? 0,
                    CompletedRequests: stats?.CompletedRequests ?? 0,
                    HelpedRequests: stats?.HelpedRequests ?? 0,
                    RejectedRequests: stats?.RejectedRequests ?? 0,
                    DailyComplaintsCount: dailyComplaintsCount,
                    LastActivityAtUtc: user.LastActivityAtUtc));
        }
    }
}
