using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.CreateReport
{
    public sealed record CreateReportCommand(
        Guid HelpRequestId,
        Guid CurrentUserId,
        string Comment,
        string? ImageUrl
    ) : IRequest<Result<Guid>>;
}
