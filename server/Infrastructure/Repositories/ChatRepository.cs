using Dapper;
using server.Application.Handlers.GetChatMessages;
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
                WHERE HelpRequestId = @HelpRequestId;
                """;

            return await connection.QuerySingleOrDefaultAsync<Chat>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));
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
    }
}
