using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
using server.Domain.Primitives;

namespace server.Application.Handlers.AddHelpRequest
{
    public class AddHelpRequestHandler : IRequestHandler<AddHelpRequestCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _repository;

        public AddHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<Guid>> Handle(
            AddHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
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

                foreach (var imageUrl in request.ImageUrls)
                {
                    helpRequest.AddImage(imageUrl);
                }

                await _repository.AddAsync(helpRequest, ct);

                return Result<Guid>.Success(helpRequest.Id);
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