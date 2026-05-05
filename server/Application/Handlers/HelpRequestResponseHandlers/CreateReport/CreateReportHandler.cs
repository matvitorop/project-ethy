using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using server.Infrastructure;

namespace server.Application.Handlers.HelpRequestResponseHandlers.CreateReport
{
    public sealed class CreateReportHandler
        : IRequestHandler<CreateReportCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IReportRepository _reportRepository;
        private readonly IImageStorageService _storage;

        public CreateReportHandler(
            IHelpRequestRepository repository,
            IReportRepository reportRepository,
            IImageStorageService storage)
        {
            _repository = repository;
            _reportRepository = reportRepository;
            _storage = storage;
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
                string? imageUrl = null;
                if (!string.IsNullOrEmpty(request.ImageUrl))
                {
                    imageUrl = await _storage
                        .MoveReportImageFromTempAsync(request.ImageUrl, ct);
                }

                var report = new HelpRequestReport(
                    request.HelpRequestId,
                    request.CurrentUserId,
                    request.Comment,
                    imageUrl);

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
