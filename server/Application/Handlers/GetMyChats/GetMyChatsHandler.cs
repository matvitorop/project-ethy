using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetMyChats
{
    public sealed class GetMyChatsHandler
        : IRequestHandler<GetMyChatsQuery, Result<IReadOnlyList<ChatListItemDto>>>
    {
        private readonly IChatRepository _chatRepository;

        public GetMyChatsHandler(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        public async Task<Result<IReadOnlyList<ChatListItemDto>>> Handle(
            GetMyChatsQuery request,
            CancellationToken ct)
        {
            var chats = await _chatRepository
                .GetMyChatsAsync(request.UserId, ct);

            return Result<IReadOnlyList<ChatListItemDto>>.Success(chats);
        }
    }
}
