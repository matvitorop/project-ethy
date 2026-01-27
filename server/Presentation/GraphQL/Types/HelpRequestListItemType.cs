using GraphQL.Types;
using server.Application.Handlers.GetActiveRequests;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestListItemType
    : ObjectGraphType<HelpRequestListItemDto>
    {
        public HelpRequestListItemType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Title);
            Field(x => x.Status);
            Field(x => x.PreviewImageUrl, nullable: true);
            Field(x => x.CreatedAt);
        }
    }
}
