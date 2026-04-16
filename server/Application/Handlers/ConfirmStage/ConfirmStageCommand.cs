using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.ConfirmStage
{
    public sealed record ConfirmStageCommand(
        Guid StageId,
        Guid UserId
    ) : IRequest<Result>;
}
