using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.RejectStage
{
    public sealed record RejectStageCommand(
        Guid StageId,
        Guid UserId,
        string Reason
    ) : IRequest<Result>;
}
