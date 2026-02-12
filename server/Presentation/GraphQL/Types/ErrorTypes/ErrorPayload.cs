namespace server.Presentation.GraphQL.Types.ErrorTypes
{
    public sealed record ErrorPayload(
        string Code,
        string Message
    );
}
