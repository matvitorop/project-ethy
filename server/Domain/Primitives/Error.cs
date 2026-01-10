namespace server.Domain.Primitives
{
    public record Error (string Message, string Code)
    {
        public static readonly Error None = new(string.Empty, string.Empty);

        public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null.");
    }
}