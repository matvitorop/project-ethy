using GraphQL.Types;
using server.Application.Handlers.AddHelpRequest;

namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public class AddHelpRequestPayloadType
    : ObjectGraphType<AddHelpRequestPayload>
    {
        public AddHelpRequestPayloadType()
        {
            Field(x => x.Success).Description("Indicates if the operation was successful.");
            Field(x => x.HelpRequestId, nullable: true).Description("The ID of the created request.");
            Field(x => x.ErrorCode, nullable: true).Description("Error code if failed.");
            Field(x => x.ErrorMessage, nullable: true).Description("Error message if failed.");
        }
    }
}
