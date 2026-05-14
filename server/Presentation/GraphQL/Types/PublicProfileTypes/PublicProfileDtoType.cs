using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetPublicProfile;

namespace server.Presentation.GraphQL.Types.PublicProfileTypes
{
    public class PublicProfileDtoType : ObjectGraphType<PublicProfileDto>
    {
        public PublicProfileDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.Role);
            Field(x => x.RegisteredAtUtc);
            Field(x => x.IsEmailVerified);
            Field(x => x.HasPhone);
            Field(x => x.HasSocialLinks);
            Field(x => x.PhoneNumber, nullable: true);
            Field(x => x.SocialLinks, nullable: true);
            Field(x => x.PositiveReviews);
            Field(x => x.NegativeReviews);
            Field(x => x.TotalRequests);
            Field(x => x.CompletedRequests);
            Field(x => x.HelpedRequests);
            Field(x => x.RejectedRequests);
        }
    }
}
