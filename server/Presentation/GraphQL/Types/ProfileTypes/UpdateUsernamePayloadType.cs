using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed class UpdateUsernamePayloadType
        : ObjectGraphType<UpdateUsernamePayload>
    {
        public UpdateUsernamePayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
