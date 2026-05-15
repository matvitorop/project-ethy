using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System.Text.Json;

namespace server.Application.Handlers.EditHelpRequest
{
    public sealed class EditHelpRequestHandler
        : IRequestHandler<EditHelpRequestCommand, Result>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IImageStorageService _imageStorage;

        public EditHelpRequestHandler(IHelpRequestRepository repository, IImageStorageService imageStorage)
        {
            _repository = repository;
            _imageStorage = imageStorage;
        }

        public async Task<Result> Handle(
            EditHelpRequestCommand request,
            CancellationToken ct)
        {
            var helpRequest = await _repository
                .GetAggregateByIdAsync(ct, request.HelpRequestId);

            if (helpRequest is null)
                return Result.Failure(
                    new Error("Help request not found", "HelpRequest.NOT_FOUND"));

            if (helpRequest.CreatorId != request.CurrentUserId)
                return Result.Failure(
                    new Error("Access denied", "HelpRequest.FORBIDDEN"));

            try
            {
                var permanentImageUrls = await _imageStorage.CommitHelpRequestImagesAsync(request.ImageUrls);

                helpRequest.UpdateImages(permanentImageUrls);

                helpRequest.Edit(
                    request.Title,
                    request.Description,
                    request.Latitude,
                    request.Longitude);
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error(ex.Message, ex.Code));
            }
            catch (FileNotFoundException)
            {
                return Result.Failure(new Error("Images session expired or files not found", "HelpRequest.IMAGE_EXPIRED"));
            }

            var logEvent = new HelpRequestEvent(
                helpRequest.Id,
                request.CurrentUserId,
                HelpRequestEventType.HelpRequestEdited,
                JsonSerializer.Serialize(new
                {
                    title = helpRequest.Title,
                    description = helpRequest.Description
                }));

            await _repository.EditAsync(helpRequest, logEvent, ct);

            return Result.Success();
        }
    }
}
