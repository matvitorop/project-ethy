using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReviewTypes
{
    public sealed class LeaveReviewPayloadType : ObjectGraphType<LeaveReviewPayload>
    {
        public LeaveReviewPayloadType()
        {
            Field<IdGraphType>("reviewId")
                .Resolve(ctx => ctx.Source.ReviewId);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }

}
