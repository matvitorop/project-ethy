using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.ResponseToHelpRequestHandler
{
    public class ResponseToHelpRequestHandler : IRequestHandler<ResponseToHelpRequestCommand, Result<Guid>>
    {

        private readonly IHelpRequestRepository _repository;

        public ResponseToHelpRequestHandler(
            IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<Guid>> Handle(ResponseToHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
                var helpRequest = await _repository.GetAggregateByIdAsync(ct, request.HelpRequestId);

                if (helpRequest is null)
                    return Result<Guid>.Failure(new Error("Help request not found", "HelpRequest.NOT_FOUND"));

                var newResponse = helpRequest.AddResponse(request.UserId, request.Message);
                
                await _repository.AddResponseAsync(helpRequest.Id, newResponse, ct);
                
                return Result<Guid>.Success(newResponse.Id);
            }
            catch (DomainException ex)
            {
                return Result<Guid>.Failure(new Error(ex.Message, ex.Code));
            }
            catch (Exception)
            {
                return Result<Guid>.Failure(new Error("An unexpected error occurred", "HelpRequestResponse.GENERAL_ERROR"));
            }
        }
    }
}
