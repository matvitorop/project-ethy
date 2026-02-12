using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.LoginTypes
{
    public class LoginPayloadType : ObjectGraphType<LoginPayload>
    {
        public LoginPayloadType()
        {
            Field(x => x.Token, nullable: true);
            
            Field<ErrorPayloadType>("error")
                .Resolve(context => context.Source.Error);
        }
    }
}
