using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class ComplaintsPayloadType : ObjectGraphType<ComplaintsPayload>
    {
        public ComplaintsPayloadType()
        {
            IsTypeOf = obj => obj is ComplaintsPayload;
            Field<ListGraphType<AdminComplaintDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
