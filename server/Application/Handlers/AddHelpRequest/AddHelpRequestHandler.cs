using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.AddHelpRequest
{
    public class AddHelpRequestHandler : IRequestHandler<AddHelpRequestCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IImageStorageService _imageStorage;

        public AddHelpRequestHandler(IHelpRequestRepository repository, IImageStorageService imageStorage)
        {
            _repository = repository;
            _imageStorage = imageStorage;
        }

        public async Task<Result<Guid>> Handle(
            AddHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
                var permanentImageUrls = await _imageStorage.CommitHelpRequestImagesAsync(request.ImageUrls);

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

                return Result<Guid>.Success(helpRequest.Id);
            }
            catch (FileNotFoundException)
            {
                return Result.Failure<Guid>(new Error(
                    "Attachments.Expired",
                    "Images session expired or files not found. Please upload images again."
                ));
            }
            catch (ArgumentException ex)
            {
                return Result.Failure<Guid>(new Error(
                    "HelpRequest.Validation",
                    ex.Message
                ));
            }
            catch (Exception ex)
            {
                return Result.Failure<Guid>(new Error(
                   "HelpRequest.GeneralError",
                   "An unexpected error occurred."
                ));
            }
        }
    }
}