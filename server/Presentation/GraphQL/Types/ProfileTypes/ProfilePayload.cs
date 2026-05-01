using server.Application.Handlers.User.GetProfile;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed record ProfilePayload(
        ProfileDto? Profile,
        ErrorPayload? Error
    );
}
