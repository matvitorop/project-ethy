using GraphQL.Types;
using server.Application.Handlers.AddHelpRequest;

namespace server.Presentation.GraphQL.Types
{
    public class AddHelpRequestPayloadType
    : ObjectGraphType<AddHelpRequestResult>
    {
        public AddHelpRequestPayloadType()
        {
            Field(x => x.Success);
            Field(x => x.HelpRequestId, nullable: true);
            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
