using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class AdminActionPayloadType : ObjectGraphType<AdminActionPayload>
    {
        public AdminActionPayloadType()
        {
            Field(x => x.Success, nullable: true);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
