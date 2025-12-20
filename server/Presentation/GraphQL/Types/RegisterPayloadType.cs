using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class RegisterPayloadType : ObjectGraphType
    {
        public RegisterPayloadType()
        {
            Field<NonNullGraphType<BooleanGraphType>>("success");
            Field<StringGraphType>("token");
            Field<StringGraphType>("errorCode");
            Field<StringGraphType>("errorMessage");
        }
    }
}
