using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.ProposeStage
{
    public sealed record ProposeStageCommand(
        Guid HelpRequestId,
        Guid ChatId,
        Guid UserId,
        string Content
    ) : IRequest<Result<Guid>>;
}
