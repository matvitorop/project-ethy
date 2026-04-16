using MediatR;
using server.Application.Handlers.GetStages;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetEventLog
{
    public sealed class GetEventLogHandler
        : IRequestHandler<GetEventLogQuery, Result<IReadOnlyList<EventLogDto>>>
    {
        private readonly IStageRepository _stageRepository;

        public GetEventLogHandler(IStageRepository stageRepository)
        {
            _stageRepository = stageRepository;
        }

        public async Task<Result<IReadOnlyList<EventLogDto>>> Handle(
            GetEventLogQuery request, CancellationToken ct)
        {
            var events = await _stageRepository
                .GetEventLogAsync(request.HelpRequestId, ct);

            return Result<IReadOnlyList<EventLogDto>>.Success(events);
        }
    }
}
