using GraphQL.Types;
using server.Domain.HelpRequest;

namespace server.Presentation.GraphQL.Types
{
    public sealed class HelpRequestStatusEnumType
    : EnumerationGraphType<HelpRequestStatus>
    {
        public HelpRequestStatusEnumType()
        {
            Name = "HelpRequestStatus";
            Description = "Status of help request";
        }
    }
}
