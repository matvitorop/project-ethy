using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.GetMyChats
{
    public sealed record GetMyChatsQuery(
        Guid UserId
    ) : IRequest<Result<IReadOnlyList<ChatListItemDto>>>;
}
