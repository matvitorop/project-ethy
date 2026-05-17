using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SubmitVolunteerApplicationTypes
{
    public class SubmitVolunteerApplicationPayloadType
    : ObjectGraphType<SubmitVolunteerApplicationPayload>
    {
        public SubmitVolunteerApplicationPayloadType()
        {
            Field<IdGraphType>("applicationId")
            .Resolve(ctx => ctx.Source.ApplicationId);
            Field<ErrorPayloadType>("error").Resolve(ctx => ctx.Source.Error);
        }
    }
}
