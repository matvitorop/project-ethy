namespace server.Application.Handlers.AdminHandlers.AdminGetHelpRequests
{
    public record AdminHelpRequestDto(
        Guid Id,
        string Title,
        int Status,
        bool IsHidden,
        bool IsDeleted,
        string CreatorUsername,
        DateTime CreatedAtUtc
    );
}
