using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class ChangeHelpRequestStatusPayloadType : ObjectGraphType<ChangeHelpRequestStatusPayload>
    {
        public ChangeHelpRequestStatusPayloadType()
        {
            Field(x => x.IsSuccess);
            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
