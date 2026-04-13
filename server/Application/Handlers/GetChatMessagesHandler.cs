namespace server.Application.Handlers
{
    using global::server.Application.Handlers.GetChatMessages;
    using global::server.Application.IRepositories;
    using global::server.Domain.Primitives;
    using MediatR;

    namespace server.Application.Handlers.GetChatMessages
    {
        public sealed class GetChatMessagesHandler
            : IRequestHandler<GetChatMessagesQuery, Result<IReadOnlyList<ChatMessageDto>>>
        {
            private readonly IChatRepository _chatRepository;

            public GetChatMessagesHandler(IChatRepository chatRepository)
            {
                _chatRepository = chatRepository;
            }

            public async Task<Result<IReadOnlyList<ChatMessageDto>>> Handle(
                GetChatMessagesQuery request,
                CancellationToken ct)
            {
                var chat = await _chatRepository
                    .GetByHelpRequestIdAsync(request.HelpRequestId, ct);

                if (chat is null)
                    return Result<IReadOnlyList<ChatMessageDto>>.Failure(
                        new Error("Chat not found", "Chat.NOT_FOUND"));

                // Тільки учасники чату мають доступ
                if (chat.OwnerId != request.RequestingUserId &&
                    chat.AssigneeId != request.RequestingUserId)
                    return Result<IReadOnlyList<ChatMessageDto>>.Failure(
                        new Error("Access denied", "Chat.FORBIDDEN"));

                var messages = await _chatRepository
                    .GetMessagesAsync(chat.Id, ct);

                return Result<IReadOnlyList<ChatMessageDto>>.Success(messages);
            }
        }
    }
}
