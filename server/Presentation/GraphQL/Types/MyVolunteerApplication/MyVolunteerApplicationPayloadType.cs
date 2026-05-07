using GraphQL.Types;
using server.Presentation.GraphQL.Types.AdminTypes;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.MyVolunteerApplication
{
    public class MyVolunteerApplicationPayloadType
    : ObjectGraphType<MyVolunteerApplicationPayload>
    {
        public MyVolunteerApplicationPayloadType()
        {
            //IsTypeOf = obj => obj is MyVolunteerApplicationPayload;
            Field<VolunteerApplicationDtoType>("application")
                .Resolve(ctx => ctx.Source.Application);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
