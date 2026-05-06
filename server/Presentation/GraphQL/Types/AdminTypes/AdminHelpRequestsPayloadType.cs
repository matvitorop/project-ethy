using GraphQL.Types;
using server.Application.Handlers.AdminHandlers.AdminGetHelpRequests;
using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public record AdminHelpRequestsPayload(List<AdminHelpRequestDto>? Items, ErrorPayload? Error);
    public class AdminHelpRequestsPayloadType : ObjectGraphType<AdminHelpRequestsPayload>
    {
        public AdminHelpRequestsPayloadType()
        {
            Field<ListGraphType<AdminHelpRequestDtoType>>("items")
                .Resolve(ctx => ctx.Source.Items);
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
