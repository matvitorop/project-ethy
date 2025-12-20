using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class LoginPayloadType : ObjectGraphType
    {
        public LoginPayloadType()
        {
            Field<NonNullGraphType<BooleanGraphType>>("success");
            Field<StringGraphType>("token");
            Field<StringGraphType>("errorCode");
            Field<StringGraphType>("errorMessage");
        }
    }
}
