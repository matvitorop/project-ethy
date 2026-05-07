using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetPublicProfile;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.PublicProfileTypes
{
    public class PublicProfilePayloadType : ObjectGraphType<PublicProfilePayload>
    {
        public PublicProfilePayloadType()
        {
            Field<PublicProfileDtoType>("profile")
                .Resolve(ctx => ctx.Source.Profile);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
