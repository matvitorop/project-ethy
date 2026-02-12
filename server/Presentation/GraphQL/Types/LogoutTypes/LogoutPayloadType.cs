using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.LogoutTypes
{
    public class LogoutPayloadType : ObjectGraphType<LogoutPayload>
    {
        public LogoutPayloadType()
        {
            Field(x => x.Message, nullable: true).Description("A message confirming the logout action.");
            
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);

        }
    }
}
