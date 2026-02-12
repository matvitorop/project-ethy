using GraphQL.Types;

namespace server.Presentation.GraphQL.Types.LoginTypes
{
    public class LoginPayloadType : ObjectGraphType<LoginPayload>
    {
        public LoginPayloadType()
        {
            Field(x => x.Success);
            Field(x => x.Token, nullable: true);
            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
