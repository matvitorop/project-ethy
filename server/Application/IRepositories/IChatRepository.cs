using server.Application.Handlers.GetChatMessages;
using server.Domain.Chat;

namespace server.Application.IRepositories
{
    public interface IChatRepository
    {
        Task CreateAsync(Chat chat, CancellationToken ct);
        Task<Chat?> GetByHelpRequestIdAsync(Guid helpRequestId, CancellationToken ct);
        Task AddMessageAsync(ChatMessage message, CancellationToken ct);
        Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(Guid chatId, CancellationToken ct);
    }
}
