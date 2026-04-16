using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.DeleteStage
{
    public sealed record DeleteStageCommand(
        Guid StageId,
        Guid UserId
    ) : IRequest<Result>;
}
