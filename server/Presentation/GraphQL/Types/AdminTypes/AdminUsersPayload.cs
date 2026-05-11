using System.Collections.Generic;
using server.Application.Handlers.AdminHandlers.AdminGetUsers;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public sealed record AdminUsersPayload(
        IReadOnlyList<AdminUserDto>? Items,
        ErrorPayload? Error
    );
}
