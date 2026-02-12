using GraphQL.Types;

namespace server.Presentation.GraphQL.Types.RegistartionTypes
{
    public class RegisterPayloadType : ObjectGraphType<RegisterPayload>
    {
        public RegisterPayloadType()
        {
            Field(x => x.Success);
            Field(x => x.Token, nullable: true);
            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
