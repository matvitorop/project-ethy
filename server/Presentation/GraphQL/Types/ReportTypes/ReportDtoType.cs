using GraphQL.Types;
using server.Application.Handlers.HelpRequestResponseHandlers.GetReports;

namespace server.Presentation.GraphQL.Types.ReportTypes
{
    public sealed class ReportDtoType : ObjectGraphType<ReportDto>
    {
        public ReportDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.CreatedByUserId, type: typeof(GuidGraphType));
            Field(x => x.LastAssignedUserId, type: typeof(GuidGraphType), nullable: true);
            Field(x => x.Comment);
            Field(x => x.ImageUrl, nullable: true);
            Field(x => x.CreatedAtUtc);
        }
    }
}
