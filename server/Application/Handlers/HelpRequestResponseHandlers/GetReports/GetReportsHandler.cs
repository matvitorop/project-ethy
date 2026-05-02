using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.GetReports
{
    public sealed class GetReportsHandler
        : IRequestHandler<GetReportsQuery, Result<IReadOnlyList<ReportDto>>>
    {
        private readonly IReportRepository _reportRepository;
        private readonly IHelpRequestRepository _helpRequestRepository;

        public GetReportsHandler(
            IReportRepository reportRepository,
            IHelpRequestRepository helpRequestRepository)
        {
            _reportRepository = reportRepository;
            _helpRequestRepository = helpRequestRepository;
        }

        public async Task<Result<IReadOnlyList<ReportDto>>> Handle(
            GetReportsQuery request,
            CancellationToken ct)
        {
            var helpRequest = await _helpRequestRepository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result<IReadOnlyList<ReportDto>>.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            var reports = await _reportRepository
                .GetByHelpRequestIdAsync(
                    request.HelpRequestId,
                    helpRequest.LastAssignedUserId,
                    ct);

            return Result<IReadOnlyList<ReportDto>>.Success(reports);
        }
    }
}
