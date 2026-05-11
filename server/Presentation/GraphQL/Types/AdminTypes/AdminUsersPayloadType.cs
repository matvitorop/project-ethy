using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public sealed class AdminUsersPayloadType : ObjectGraphType<AdminUsersPayload>
    {
        public AdminUsersPayloadType()
        {
            Field<ListGraphType<AdminUserDtoType>>("items");
            Field<ErrorPayloadType>("error");
        }
    }
}
