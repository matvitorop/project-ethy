using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.RestoreHelpRequestTypes
{
    public sealed class RestoreHelpRequestPayloadType
        : ObjectGraphType<RestoreHelpRequestPayload>
    {
        public RestoreHelpRequestPayloadType()
        {
            Field(x => x.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
