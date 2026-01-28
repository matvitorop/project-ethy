namespace server.Application.Handlers.GetFullHelpRequest
{
    public sealed record HelpRequestDetailDto
    {
        public Guid Id { get; init; }
        public Guid CreatorId { get; init; }
        public string Title { get; init; } = null!;
        public string Description { get; init; } = null!;
        public int Status { get; init; }
        public double? Latitude { get; init; }
        public double? Longitude { get; init; }
        public DateTime CreatedAtUtc { get; init; }

        public IReadOnlyList<string> ImageUrls { get; init; } = [];
    }
}
