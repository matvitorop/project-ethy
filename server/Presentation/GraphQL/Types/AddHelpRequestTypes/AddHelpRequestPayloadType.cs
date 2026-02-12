using GraphQL.Types;
using server.Application.Handlers.AddHelpRequest;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public class AddHelpRequestPayloadType
    : ObjectGraphType<AddHelpRequestPayload>
    {
        public AddHelpRequestPayloadType()
        {
            Field(x => x.HelpRequestId, nullable: true).Description("The ID of the created request.");
            
            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
