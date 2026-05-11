using MediatR;
using server.Application.IRepositories;
using server.Domain.Chat;
using server.Domain.Exceptions;
using server.Domain.Primitives;
using server.Application.Events;

namespace server.Application.Handlers.SendMessage
{
    public sealed class SendMessageHandler
        : IRequestHandler<SendMessageCommand, Result<Guid>>
    {
        private readonly IChatRepository _chatRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMediator _mediator;

        public SendMessageHandler(
            IChatRepository chatRepository, 
            IUserRepository userRepository, 
            IMediator mediator)
        {
            _chatRepository = chatRepository;
            _userRepository = userRepository;
            _mediator = mediator;
        }

        public async Task<Result<Guid>> Handle(
            SendMessageCommand request,
            CancellationToken ct)
        {
            var chat = await _chatRepository
                .GetByHelpRequestIdAsync(request.HelpRequestId, ct);

            if (chat is null)
                return Result<Guid>.Failure(
                    new Error("Chat not found", "Chat.NOT_FOUND"));

            if (chat.OwnerId != request.SenderId &&
                chat.AssigneeId != request.SenderId)
                return Result<Guid>.Failure(
                    new Error("Access denied", "Chat.FORBIDDEN"));

            try
            {
                var message = new ChatMessage(chat.Id, request.SenderId, request.Content);
                await _chatRepository.AddMessageAsync(message, ct);

                var receiverId = chat.OwnerId == request.SenderId ? chat.AssigneeId : chat.OwnerId;
                var sender = await _userRepository.GetByIdAsync(request.SenderId, ct);

                await _mediator.Publish(new ChatMessageSentEvent(
                    chat.Id,
                    request.SenderId,
                    receiverId,
                    sender?.Username ?? "Користувач",
                    request.Content), ct);

                return Result<Guid>.Success(message.Id);
            }
            catch (DomainException ex)
            {
                return Result<Guid>.Failure(new Error(ex.Message, ex.Code));
            }
        }
    }
}
