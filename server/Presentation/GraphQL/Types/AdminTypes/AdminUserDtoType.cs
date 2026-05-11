using GraphQL.Types;
using server.Application.Handlers.AdminHandlers.AdminGetUsers;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public sealed class AdminUserDtoType : ObjectGraphType<AdminUserDto>
    {
        public AdminUserDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.Email);
            Field(x => x.Role);
            Field(x => x.RegisteredAtUtc);
            Field(x => x.IsBlocked);
            Field(x => x.BlockedUntilUtc, nullable: true);
            Field(x => x.IsDeleted);
        }
    }
}
