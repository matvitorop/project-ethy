using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.HelpRequestResponseHandlers.CreateReport
{
    public sealed class CreateReportHandler
        : IRequestHandler<CreateReportCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IReportRepository _reportRepository;

        public CreateReportHandler(
            IHelpRequestRepository repository,
            IReportRepository reportRepository)
        {
            _repository = repository;
            _reportRepository = reportRepository;
        }

        public async Task<Result<Guid>> Handle(
            CreateReportCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result<Guid>.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result<Guid>.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            if (helpRequest.Status != HelpRequestStatus.Resolved)
                return Result<Guid>.Failure(
                    new Error(
                        "Reports can only be created for resolved requests",
                        "HelpRequest.NOT_RESOLVED"));

            try
            {
                var report = new HelpRequestReport(
                    request.HelpRequestId,
                    request.CurrentUserId,
                    request.Comment,
                    request.ImageUrl);

                await _reportRepository.AddAsync(report, ct);

                return Result<Guid>.Success(report.Id);
            }
            catch (DomainException ex)
            {
                return Result<Guid>.Failure(new Error(ex.Message, ex.Code));
            }
        }
    }
}
