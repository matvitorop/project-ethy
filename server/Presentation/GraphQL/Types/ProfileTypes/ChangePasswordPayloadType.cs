using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed class ChangePasswordPayloadType
        : ObjectGraphType<ChangePasswordPayload>
    {
        public ChangePasswordPayloadType()
        {
            Field(x => x.Success);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
