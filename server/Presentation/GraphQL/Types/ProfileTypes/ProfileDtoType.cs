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
            // Trust module
            Field(x => x.PhoneNumber, nullable: true);
            Field(x => x.SocialLinks, nullable: true);
            Field(x => x.IsEmailVerified);
            Field(x => x.Role);
            Field(x => x.ActiveRequestsCount);
            Field(x => x.ActiveResponsesCount);
            Field(x => x.TotalRequests);
            Field(x => x.CompletedRequests);
            Field(x => x.HelpedRequests);
            Field(x => x.RejectedRequests);
            Field(x => x.DailyComplaintsCount);
            // ---

        }
    }
}
