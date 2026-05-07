using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SubmitVolunteerApplicationTypes
{
    public record SubmitVolunteerApplicationPayload(Guid? ApplicationId, ErrorPayload? Error);
}
