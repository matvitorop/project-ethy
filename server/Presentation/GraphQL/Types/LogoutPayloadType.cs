using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class LogoutPayloadType : ObjectGraphType
    {
        public LogoutPayloadType()
        {
            Field<NonNullGraphType<BooleanGraphType>>("success");
            Field<StringGraphType>("message");
        }
    }
}
