using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetFullHelpRequest
{
    public class GetFullHelpRequestQuery : IRequest<Result<HelpRequestDetailDto>>
    {
        public Guid HelpRequestId { get; }
        public GetFullHelpRequestQuery(Guid helpRequestId)
        {
            HelpRequestId = helpRequestId;
        }
    }
}