using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ResponseToHRTypes
{
    public sealed class ResponseToHelpRequestPayloadType
        : ObjectGraphType<ResponseToHelpRequestPayload>
    {
        public ResponseToHelpRequestPayloadType()
        {
            Field<IdGraphType>("responseId")
                .Resolve(ctx => ctx.Source.ResponseId);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
