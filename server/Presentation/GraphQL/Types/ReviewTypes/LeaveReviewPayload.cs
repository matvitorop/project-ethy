using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReviewTypes
{
    public sealed record LeaveReviewPayload(Guid? ReviewId, ErrorPayload? Error);
}
