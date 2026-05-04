using Dapper;
using server.Application.Handlers.GetChatMessages;
using server.Application.Handlers.GetMyChats;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Chat;

namespace server.Infrastructure.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ChatRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task CreateAsync(Chat chat, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO Chats (Id, HelpRequestId, OwnerId, AssigneeId, CreatedAtUtc)
                VALUES (@Id, @HelpRequestId, @OwnerId, @AssigneeId, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(sql, chat, cancellationToken: ct));
        }

        public async Task<Chat?> GetByHelpRequestIdAsync(Guid helpRequestId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, HelpRequestId, OwnerId, AssigneeId, CreatedAtUtc
                FROM Chats
                WHERE HelpRequestId = @HelpRequestId
                  AND IsActive = 1;
                """;

            var row = await connection.QuerySingleOrDefaultAsync<ChatRow>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            if (row is null) return null;

            return new Chat(
                row.Id, row.HelpRequestId, row.OwnerId,
                row.AssigneeId, row.CreatedAtUtc, row.IsActive);
        }

        public async Task AddMessageAsync(ChatMessage message, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO ChatMessages (Id, ChatId, SenderId, Content, CreatedAtUtc)
                VALUES (@Id, @ChatId, @SenderId, @Content, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(sql, message, cancellationToken: ct));
        }

        public async Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(
            Guid chatId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT Id, SenderId, Content, CreatedAtUtc
                FROM ChatMessages
                WHERE ChatId = @ChatId
                ORDER BY CreatedAtUtc ASC;
                """;

            var result = await connection.QueryAsync<ChatMessageDto>(
                new CommandDefinition(sql,
                    new { ChatId = chatId },
                    cancellationToken: ct));

            return result.AsList();
        }

        public async Task<IReadOnlyList<ChatListItemDto>> GetMyChatsAsync(
            Guid userId,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT 
                    c.Id AS ChatId,
                    c.HelpRequestId,
                    hr.Title AS HelpRequestTitle,
                    c.OwnerId,
                    c.AssigneeId,
                    c.CreatedAtUtc
                FROM Chats c
                INNER JOIN HelpRequests hr ON hr.Id = c.HelpRequestId
                WHERE c.IsActive = 1
                  AND (c.OwnerId = @UserId OR c.AssigneeId = @UserId)
                  AND hr.IsDeleted = 0
                ORDER BY c.CreatedAtUtc DESC;
                """;

            var result = await connection.QueryAsync<ChatListItemDto>(
                new CommandDefinition(sql,
                    new { UserId = userId },
                    cancellationToken: ct));

            return result.AsList();
        }

        private sealed class ChatRow
        {
            public Guid Id { get; init; }
            public Guid HelpRequestId { get; init; }
            public Guid OwnerId { get; init; }
            public Guid AssigneeId { get; init; }
            public DateTime CreatedAtUtc { get; init; }
            public bool IsActive { get; init; }
        }
    }
}
