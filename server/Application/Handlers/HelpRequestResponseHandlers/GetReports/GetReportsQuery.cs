using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.GetReports
{
    public sealed record GetReportsQuery(
        Guid HelpRequestId
    ) : IRequest<Result<IReadOnlyList<ReportDto>>>;
}
