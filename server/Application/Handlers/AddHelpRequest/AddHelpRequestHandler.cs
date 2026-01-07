using MediatR;
using server.Application.IRepositories;
using server.Domain.HelpRequest;

namespace server.Application.Handlers.AddHelpRequest
{
    public class AddHelpRequestHandler : IRequestHandler<AddHelpRequestCommand, AddHelpRequestResult>
    {
        private readonly IHelpRequestRepository _repository;

        public AddHelpRequestHandler(IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<AddHelpRequestResult> Handle(
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

                return AddHelpRequestResult.Ok(helpRequest.Id);
            }
            catch (ArgumentException ex)
            {
                return AddHelpRequestResult.Fail(
                    "VALIDATION_ERROR",
                    ex.Message
                );
            }
        }
    }
}