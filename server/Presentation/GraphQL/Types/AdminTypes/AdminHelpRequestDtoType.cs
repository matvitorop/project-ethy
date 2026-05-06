using GraphQL.Types;
using server.Application.Handlers.AdminHandlers.AdminGetHelpRequests;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class AdminHelpRequestDtoType : ObjectGraphType<AdminHelpRequestDto>
    {
        public AdminHelpRequestDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.Title);
            Field(x => x.Status);
            Field(x => x.IsHidden);
            Field(x => x.IsDeleted);
            Field(x => x.CreatorUsername);
            Field(x => x.CreatedAtUtc);
        }
    }
}
