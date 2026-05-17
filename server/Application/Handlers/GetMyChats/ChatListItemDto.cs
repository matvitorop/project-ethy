namespace server.Application.Handlers.GetMyChats
{
    public sealed record ChatListItemDto(
    Guid ChatId,
    Guid HelpRequestId,
    string HelpRequestTitle,
    Guid OwnerId,
    Guid AssigneeId,
    DateTime CreatedAtUtc
);
}
