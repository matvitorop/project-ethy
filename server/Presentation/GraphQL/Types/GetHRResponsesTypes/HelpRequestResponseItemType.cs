using GraphQL.Types;
using server.Application.Handlers.GetHelpRequestResponses;

namespace server.Presentation.GraphQL.Types.GetHRResponsesTypes
{
    public sealed class HelpRequestResponseItemType
        : ObjectGraphType<HelpRequestResponseDto>
    {
        public HelpRequestResponseItemType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.UserId, type: typeof(GuidGraphType));
            Field(x => x.Message);
            Field(x => x.Status);
            Field(x => x.CreatedAtUtc);
        }
    }
}
