using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ProfileTypes
{
    public sealed record UpdateProfilePayload(bool Success, ErrorPayload? Error);

    public sealed class UpdateProfilePayloadType : ObjectGraphType<UpdateProfilePayload>
    {
        public UpdateProfilePayloadType()
        {
            Field<BooleanGraphType>("success")
                .Resolve(ctx => ctx.Source.Success);

            Field<ErrorPayloadType>("error")
                .Resolve(ctx => ctx.Source.Error);
        }
    }

}
