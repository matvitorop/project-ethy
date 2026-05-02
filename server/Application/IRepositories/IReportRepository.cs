using server.Application.Handlers.HelpRequestResponseHandlers.GetReports;
using server.Domain.HelpRequest;

namespace server.Application.IRepositories
{
    public interface IReportRepository
    {
        Task AddAsync(HelpRequestReport report, CancellationToken ct);
        Task<IReadOnlyList<ReportDto>> GetByHelpRequestIdAsync(
            Guid helpRequestId,
            Guid? lastAssignedUserId,
            CancellationToken ct);
    }
}
