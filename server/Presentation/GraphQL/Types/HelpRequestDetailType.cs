using GraphQL.Types;
using server.Application.Handlers.GetFullHelpRequest;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestDetailType : ObjectGraphType<HelpRequestDetailDto>
    {
        public HelpRequestDetailType() {

            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.CreatorId);
            Field(x => x.Title);
            Field(x => x.Description);
            Field(x => x.Status);
            Field(x => x.Latitude, nullable: true);
            Field(x => x.Longitude, nullable: true);
            Field(x => x.CreatedAtUtc);
            Field<ListGraphType<StringGraphType>>("imageUrls")
                .Resolve(context => context.Source.ImageUrls);
        } 
    }
}
