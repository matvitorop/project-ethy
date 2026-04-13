namespace server.Application.Handlers.GetChatMessages
{
    public sealed record ChatMessageDto(
        Guid Id,
        Guid SenderId,
        string Content,
        DateTime CreatedAtUtc);
}
