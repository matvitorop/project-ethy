using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RegistartionTypes
{
    public class RegisterPayloadType : ObjectGraphType<RegisterPayload>
    {
        public RegisterPayloadType()
        {
            Field(x => x.Token, nullable: true);
            Field<ErrorPayloadType>("error")
                .Resolve(context => context.Source.Error);
        }
    }
}
