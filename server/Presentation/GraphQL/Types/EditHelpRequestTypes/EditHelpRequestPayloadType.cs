using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.EditHelpRequestTypes
{
    public sealed class EditHelpRequestPayloadType
        : ObjectGraphType<EditHelpRequestPayload>
    {
        public EditHelpRequestPayloadType()
        {
            Field(x => x.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }
}
