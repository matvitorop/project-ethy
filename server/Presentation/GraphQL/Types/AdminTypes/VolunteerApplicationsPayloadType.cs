using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetVolunteerApplications;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class VolunteerApplicationsPayloadType : ObjectGraphType<VolunteerApplicationsPayload>
    {
        public VolunteerApplicationsPayloadType()
        {
            Field<ListGraphType<VolunteerApplicationDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
