using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;
using server.Domain;
using server.Application.Events;

namespace server.Application.Handlers.ResponseToHelpRequestHandler
{
    public class ResponseToHelpRequestHandler : IRequestHandler<ResponseToHelpRequestCommand, Result<Guid>>
    {
        private readonly IHelpRequestRepository _repository;
        private readonly IUserRepository _userRepository;
        private readonly IMediator _mediator;

        public ResponseToHelpRequestHandler(
            IHelpRequestRepository repository,
            IUserRepository userRepository,
            IMediator mediator)
        {
            _repository = repository;
            _userRepository = userRepository;
            _mediator = mediator;
        }

        public async Task<Result<Guid>> Handle(ResponseToHelpRequestCommand request,
            CancellationToken ct)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(request.UserId, ct);
                if (user != null && user.Role == UserRole.User)
                {
                    var activeResponsesCount = await _repository.CountActiveResponsesByUserAsync(request.UserId, ct);
                    if (activeResponsesCount >= 1)
                    {
                        return Result<Guid>.Failure(
                            new Error(
                                "Regular users can have only one active response. Complete your current task or cancel your response to offer help elsewhere.",
                                "HelpRequestResponse.LIMIT_EXCEEDED"
                            ));
                    }
                }

                var helpRequest = await _repository.GetAggregateByIdAsync(ct, request.HelpRequestId);

                if (helpRequest is null)
                    return Result<Guid>.Failure(new Error("Help request not found", "HelpRequest.NOT_FOUND"));

                var newResponse = helpRequest.AddResponse(request.UserId, request.Message);
                
                await _repository.AddResponseAsync(helpRequest.Id, newResponse, ct);

                await _mediator.Publish(new HelpRequestRespondedEvent(
                    helpRequest.Id,
                    helpRequest.CreatorId,
                    request.UserId,
                    request.Message), ct);
                
                return Result<Guid>.Success(newResponse.Id);
            }
            catch (DomainException ex)
            {
                return Result<Guid>.Failure(new Error(ex.Message, ex.Code));
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(new Error("An unexpected error occurred", "HelpRequestResponse.GENERAL_ERROR"));
            }
        }
    }
}
