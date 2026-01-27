namespace server.Application.Handlers.GetActiveRequests
{
    public sealed class HelpRequestListItemDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = null!;
        public string Category { get; init; } = null!;
        public string Status { get; init; } = null!;
        public string? PreviewImageUrl { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
