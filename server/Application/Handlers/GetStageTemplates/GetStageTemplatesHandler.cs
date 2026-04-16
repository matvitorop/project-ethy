using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetStageTemplates
{
    public sealed class GetStageTemplatesHandler
        : IRequestHandler<GetStageTemplatesQuery, Result<IReadOnlyList<StageTemplateDto>>>
    {
        private readonly IStageRepository _stageRepository;

        public GetStageTemplatesHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result<IReadOnlyList<StageTemplateDto>>> Handle(
            GetStageTemplatesQuery request, CancellationToken ct)
        {
            var templates = await _stageRepository.GetTemplatesAsync(ct);
            return Result<IReadOnlyList<StageTemplateDto>>.Success(templates);
        }
    }
}
