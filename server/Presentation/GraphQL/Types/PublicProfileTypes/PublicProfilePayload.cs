using server.Application.Handlers.UserHandlers.GetPublicProfile;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.PublicProfileTypes
{
    public record PublicProfilePayload(PublicProfileDto? Profile, ErrorPayload? Error);
}
