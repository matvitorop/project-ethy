using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetUserReviews;

namespace server.Presentation.GraphQL.Types.ReviewTypes
{
    public sealed class UserReviewDtoType : ObjectGraphType<UserReviewDto>
    {
        public UserReviewDtoType()
        {
            Field(x => x.Id, type: typeof(IdGraphType));
            Field(x => x.HelpRequestId, type: typeof(IdGraphType));
            Field(x => x.ReviewerUserId, type: typeof(IdGraphType));
            Field(x => x.ReviewerUsername);
            Field(x => x.IsPositive);
            Field(x => x.Comment, nullable: true);
            Field(x => x.CreatedAtUtc);
        }
    }

}
