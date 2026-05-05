using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetUserReviews;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReviewTypes
{
    public sealed record UserReviewsPayload(
    IEnumerable<UserReviewDto>? Reviews,
    ErrorPayload? Error);

    public sealed class UserReviewsPayloadType : ObjectGraphType<UserReviewsPayload>
    {
        public UserReviewsPayloadType()
        {
            Field<ListGraphType<UserReviewDtoType>>("reviews")
                .Resolve(ctx => ctx.Source.Reviews);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }

}
