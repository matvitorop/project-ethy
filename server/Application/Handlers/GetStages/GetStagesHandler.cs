using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetStages
{
    public sealed class GetStagesHandler
        : IRequestHandler<GetStagesQuery, Result<IReadOnlyList<StageDto>>>
    {
        private readonly IStageRepository _stageRepository;

        public GetStagesHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result<IReadOnlyList<StageDto>>> Handle(
            GetStagesQuery request, CancellationToken ct)
        {
            var stages = await _stageRepository
                .GetStagesAsync(request.HelpRequestId, ct);

            return Result<IReadOnlyList<StageDto>>.Success(stages);
        }
    }
}
