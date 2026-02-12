using GraphQL.Types;
using server.Application.Handlers.ChangeHelpRequestStatus;

namespace server.Presentation.GraphQL.Types.ChangeHRStatusTypes
{
    public sealed class ChangeHelpRequestStatusResultType
    : ObjectGraphType<ChangeHelpRequestStatusResult>
    {
        public ChangeHelpRequestStatusResultType()
        {
            Field(x => x.Id);
            Field<HelpRequestStatusEnumType>("status")
                .Resolve(ctx => ctx.Source.Status);
        }
    }
}