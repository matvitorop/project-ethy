using MediatR;
using server.Domain.Primitives;
using System.Collections.Generic;

namespace server.Application.Handlers.AdminHandlers.AdminGetUsers
{
    public sealed record AdminGetUsersQuery(
        int Page,
        int PageSize,
        string? SearchTerm = null,
        string? ShortId = null
    ) : IRequest<Result<IReadOnlyList<AdminUserDto>>>;
}
