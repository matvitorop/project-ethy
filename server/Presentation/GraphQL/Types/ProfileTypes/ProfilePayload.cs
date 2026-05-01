using server.Application.Handlers.UserHandlers.GetProfile;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed record ProfilePayload(
        ProfileDto? Profile,
        ErrorPayload? Error
    );
}
