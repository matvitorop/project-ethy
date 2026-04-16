using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetStages
{
    public sealed record GetStagesQuery(
        Guid HelpRequestId
    ) : IRequest<Result<IReadOnlyList<StageDto>>>;
}
