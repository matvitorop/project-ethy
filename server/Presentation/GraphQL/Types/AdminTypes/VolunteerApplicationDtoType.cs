using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class VolunteerApplicationDtoType : ObjectGraphType<VolunteerApplicationDto>
    {
        public VolunteerApplicationDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.UserId, type: typeof(IdGraphType));
            Field(x => x.Username);
            Field(x => x.OrganizationName);
            Field(x => x.ActivityDescription);
            Field(x => x.DocumentImageUrl, nullable: true);
            Field(x => x.Status);
            Field(x => x.AdminComment, nullable: true);
            Field(x => x.SubmittedAtUtc);
            Field(x => x.ReviewedAtUtc, nullable: true);
        }
    }
}
