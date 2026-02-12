namespace server.Presentation.GraphQL.Types
{
    public sealed record ErrorPayload(
        string Code,
        string Message
    );
}
