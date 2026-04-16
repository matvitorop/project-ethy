using server.Application.Handlers.GetStages;
using server.Application.Handlers.GetStageTemplates;
using server.Domain.HelpRequest;

namespace server.Application.IRepositories
{
    public interface IStageRepository
    {
        Task<bool> HasActiveProposedStageAsync(Guid helpRequestId, Guid chatId, CancellationToken ct);
        Task AddAsync(HelpRequestStage stage, HelpRequestEvent logEvent, CancellationToken ct);
        Task UpdateAsync(HelpRequestStage stage, HelpRequestEvent logEvent, CancellationToken ct);
        Task<HelpRequestStage?> GetByIdAsync(Guid stageId, CancellationToken ct);
        Task<IReadOnlyList<StageDto>> GetStagesAsync(Guid helpRequestId, CancellationToken ct);
        Task<IReadOnlyList<EventLogDto>> GetEventLogAsync(Guid helpRequestId, CancellationToken ct);
        Task<IReadOnlyList<StageTemplateDto>> GetTemplatesAsync(CancellationToken ct);
    }
}
