using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public sealed class ErrorPayloadType : ObjectGraphType<ErrorPayload>
    {
        public ErrorPayloadType() {
            Field(x => x.Code).Description("A machine-readable error code.");
            Field(x => x.Message).Description("A human-readable error message.");
        }
    }
}
