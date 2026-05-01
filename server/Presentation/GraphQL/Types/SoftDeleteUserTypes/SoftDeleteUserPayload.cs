using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.SoftDeleteUserTypes
{
    public sealed record SoftDeleteUserPayload(
        bool Success,
        ErrorPayload? Error
    );
}
