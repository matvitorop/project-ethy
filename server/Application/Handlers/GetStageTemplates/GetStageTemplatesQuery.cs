using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetStageTemplates
{
    public sealed record GetStageTemplatesQuery
        : IRequest<Result<IReadOnlyList<StageTemplateDto>>>;
}
