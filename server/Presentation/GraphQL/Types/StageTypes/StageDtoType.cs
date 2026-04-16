using GraphQL.Types;
using server.Application.Handlers.GetStages;

namespace server.Presentation.GraphQL.Types.StageTypes
{
    public sealed class StageDtoType : ObjectGraphType<StageDto>
    {
        public StageDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.ProposedByUserId, type: typeof(GuidGraphType));
            Field(x => x.Content);
            Field(x => x.Status);
            Field(x => x.RejectionReason, nullable: true);
            Field(x => x.CreatedAtUtc);
            Field(x => x.ResolvedAtUtc, nullable: true);
        }
    }
}
