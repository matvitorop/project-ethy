using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetComplaints;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class AdminComplaintDtoType : ObjectGraphType<AdminComplaintDto>
    {
        public AdminComplaintDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.ReporterUserId, type: typeof(IdGraphType));
            Field(x => x.ReporterUsername);
            Field(x => x.TargetUserId, type: typeof(IdGraphType));
            Field(x => x.TargetUsername);
            Field(x => x.Reason);
            Field(x => x.IsResolved);
            Field(x => x.CreatedAtUtc);
        }
    }
}
