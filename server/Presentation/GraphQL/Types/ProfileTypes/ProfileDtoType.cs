using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetProfile;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed class ProfileDtoType : ObjectGraphType<ProfileDto>
    {
        public ProfileDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.Email);
            Field(x => x.RegisteredAtUtc);
        }
    }
}
