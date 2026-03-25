using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetHelpRequestResponses
{
    public sealed record GetHelpRequestResponsesQuery(
        Guid HelpRequestId,
        Guid RequestingUserId
    ) : IRequest<Result<IReadOnlyList<HelpRequestResponseDto>>>;
}
