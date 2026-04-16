using MediatR;
using server.Application.Handlers.GetStages;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetEventLog
{
    public sealed record GetEventLogQuery(
        Guid HelpRequestId
    ) : IRequest<Result<IReadOnlyList<EventLogDto>>>;
}
