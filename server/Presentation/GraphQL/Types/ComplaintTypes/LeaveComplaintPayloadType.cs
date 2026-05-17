using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ComplaintTypes
{
    public sealed record LeaveComplaintPayload(Guid? ComplaintId, ErrorPayload? Error);

    public sealed class LeaveComplaintPayloadType : ObjectGraphType<LeaveComplaintPayload>
    {
        public LeaveComplaintPayloadType()
        {
            Field<IdGraphType>("complaintId")
                .Resolve(ctx => ctx.Source.ComplaintId);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }

}
