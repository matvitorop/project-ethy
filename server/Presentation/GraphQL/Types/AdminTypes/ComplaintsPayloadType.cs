using GraphQL.Types;
using server.Application.Handlers.UserHandlers.GetComplaints;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class ComplaintsPayloadType : ObjectGraphType<Result<List<AdminComplaintDto>>>
    {
        public ComplaintsPayloadType()
        {
            Field<ListGraphType<AdminComplaintDtoType>>("items")
                .Resolve(ctx => ctx.Source.IsSuccess ? ctx.Source.Value : null);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.IsSuccess ? null
                    : new ErrorPayload(ctx.Source.Error!.Message, ctx.Source.Error.Code));
        }
    }
}
