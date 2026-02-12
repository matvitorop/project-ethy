using GraphQL.Types;

namespace server.Presentation.GraphQL.Types.LogoutTypes
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
