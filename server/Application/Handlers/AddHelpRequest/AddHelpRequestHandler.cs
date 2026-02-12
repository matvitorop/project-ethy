using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.AddHelpRequest
{
    public class AddHelpRequestHandler : IRequestHandler<AddHelpRequestCommand, Result<AddHelpRequestResult>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IImageStorageService _imageStorage;

        public AddHelpRequestHandler(IHelpRequestRepository repository, IImageStorageService imageStorage)
        {
            _repository = repository;
            _imageStorage = imageStorage;
        }

        public async Task<Result<AddHelpRequestResult>> Handle(
            AddHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
                var permanentImageUrls =
                    await _imageStorage.CommitHelpRequestImagesAsync(request.ImageUrls);

                HelpRequestGeoPoint? location = null;

                if (request.Latitude.HasValue && request.Longitude.HasValue)
                {
                    location = new HelpRequestGeoPoint(
                        request.Latitude.Value,
                        request.Longitude.Value
                    );
                }

                var helpRequest = new HelpRequest(
                    request.CreatorId,
                    request.Title,
                    request.Description,
                    location
                );

                foreach (var url in permanentImageUrls)
                {
                    helpRequest.AddImage(url);
                }

                await _repository.AddAsync(helpRequest, ct);

                
                var result = new AddHelpRequestResult(
                    helpRequest.Id,
                    helpRequest.Title,
                    helpRequest.Description,
                    helpRequest.CreatorId,
                    helpRequest.CreatedAtUtc,
                    helpRequest.Status,
                    location?.Latitude,
                    location?.Longitude,
                    permanentImageUrls
                );

                return Result<AddHelpRequestResult>.Success(result);
            }
            catch (FileNotFoundException)
            {
                return Result.Failure<AddHelpRequestResult>(
                    new Error(
                        "Images session expired or files not found. Please upload images again.",
                        "HelpRequest.IMAGE_WAS_EXPIRED"
                    ));
            }
            catch (ArgumentException ex)
            {
                return Result.Failure<AddHelpRequestResult>(
                    new Error(
                        ex.Message,
                        "HelpRequest.CREATION_VALIDATION"
                    ));
            }
            catch (DomainException ex)
            {
                return Result.Failure<AddHelpRequestResult>(
                    new Error(
                        ex.Message,
                        ex.Code
                    ));
            }
            catch (Exception)
            {
                return Result.Failure<AddHelpRequestResult>(
                    new Error(
                        "An unexpected error occurred.",
                        "HelpRequest.GENERAL_ERROR"
                    ));
            }
        }
    }
}