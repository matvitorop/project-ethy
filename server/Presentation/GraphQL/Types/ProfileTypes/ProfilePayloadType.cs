using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed class ProfilePayloadType : ObjectGraphType<ProfilePayload>
    {
        public ProfilePayloadType()
        {
            Field<ProfileDtoType>("profile")
                .Resolve(ctx => ctx.Source.Profile);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
