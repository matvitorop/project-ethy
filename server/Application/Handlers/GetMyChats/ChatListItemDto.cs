namespace server.Application.Handlers.GetMyChats
{
    public record ChatListItemDto(
        Guid ChatId,
        Guid HelpRequestId,
        string HelpRequestTitle,
        int HelpRequestStatus,
        Guid OwnerId,
        Guid AssigneeId,
        DateTime CreatedAtUtc
    );
}
