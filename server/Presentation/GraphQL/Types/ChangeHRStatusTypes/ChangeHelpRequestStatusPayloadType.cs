using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ChangeHRStatusTypes
{
    public class ChangeHelpRequestStatusPayloadType : ObjectGraphType<ChangeHelpRequestStatusPayload>
    {
        public ChangeHelpRequestStatusPayloadType()
        {
            Field<ChangeHelpRequestStatusResultType>("data")
                .Resolve(ctx => ctx.Source.Data);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
