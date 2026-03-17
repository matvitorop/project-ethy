using MediatR;
using server.Application.IRepositories;
using server.Domain.Exceptions;
using server.Domain.Primitives;

namespace server.Application.Handlers.ResponseToHelpRequestHandler
{
    public class ResponseToHelpRequestHandler : IRequestHandler<ResponseToHelpRequestCommand, Result>
    {

        private readonly IHelpRequestRepository _repository;

        public ResponseToHelpRequestHandler(
            IHelpRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> Handle(ResponseToHelpRequestCommand request,
            CancellationToken ct)
        {
             
        }
    }
}
