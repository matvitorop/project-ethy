using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.AdminHandlers.AdminGetHelpRequests
{
    public record AdminGetHelpRequestsQuery(
        int Page,
        int PageSize,
        bool? IsHidden,
        bool? IsDeleted,
        List<int>? Statuses = null,
        string? SearchTerm = null
    ) : IRequest<Result<List<AdminHelpRequestDto>>>;
}
