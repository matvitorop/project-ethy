using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Exceptions;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using server.Domain;

namespace server.Application.Handlers.AddHelpRequest
{
    public class AddHelpRequestHandler : IRequestHandler<AddHelpRequestCommand, Result<AddHelpRequestResult>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IImageStorageService _imageStorage;
        private readonly IUserRepository _userRepository;

        public AddHelpRequestHandler(IHelpRequestRepository repository, IImageStorageService imageStorage, IUserRepository userRepository)
        {
            _repository = repository;
            _imageStorage = imageStorage;
            _userRepository = userRepository;
        }

        public async Task<Result<AddHelpRequestResult>> Handle(
            AddHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(request.CreatorId, ct);
                if (user != null && user.Role == UserRole.User)
                {
                    var activeCount = await _repository.CountActiveRequestsByCreatorAsync(request.CreatorId, ct);
                    if (activeCount >= 3)
                    {
                        return Result.Failure<AddHelpRequestResult>(
                            new Error(
                                "Regular users can have a maximum of 3 active help requests. Complete or cancel your current requests to create new ones.",
                                "HelpRequest.LIMIT_EXCEEDED"
                            ));
                    }
                }

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