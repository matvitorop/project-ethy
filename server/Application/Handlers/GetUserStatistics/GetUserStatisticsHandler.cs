using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetUserStatistics
{
    public class GetUserStatisticsHandler : IRequestHandler<GetUserStatisticsQuery, Result<UserStatisticsDto?>>
    {
        private readonly IUserRepository _userRepository;

        public GetUserStatisticsHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Result<UserStatisticsDto?>> Handle(GetUserStatisticsQuery request, CancellationToken ct)
        {
            var statistic = await _userRepository.GetUserStatisticsAsync(request.userId, ct);
            
            if (statistic is null)
            {
                return Result<UserStatisticsDto?>.Failure(new Error(
                    "User not found or statistic not available",
                    "User.USER_NOT_FOUND"
                ));
            }

            return Result<UserStatisticsDto?>.Success(statistic);
        }

    }
}
