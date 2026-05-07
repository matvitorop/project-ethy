using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.AdminGetHelpRequests
{
    public record AdminGetHelpRequestsQuery(
        int Page,
        int PageSize,
        bool? IsHidden,
        bool? IsDeleted
    ) : IRequest<Result<List<AdminHelpRequestDto>>>;
}
