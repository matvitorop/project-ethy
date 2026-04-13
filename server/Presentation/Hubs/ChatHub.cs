using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using server.Application.Handlers.SendMessage;
using server.Presentation.GraphQL.Extensions;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace server.Presentation.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;

        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        //Join to appropriate chat group based on helpRequestId
        public async Task JoinChat(string helpRequestId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, helpRequestId);
        }

        //Left the chat group
        public async Task LeaveChat(string helpRequestId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, helpRequestId);
        }

        //Send message to the chat.
        public async Task SendMessage(string helpRequestId, string content)
        {
            var senderId = Guid.Parse(
                Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _mediator.Send(
                new SendMessageCommand(
                    Guid.Parse(helpRequestId),
                    senderId,
                    content));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync("Error", result.Error.Code, result.Error.Message);
                return;
            }

            //Send the message to all users in the group
            await Clients.Group(helpRequestId).SendAsync("ReceiveMessage", new
            {
                messageId = result.Value,
                senderId,
                content,
                createdAtUtc = DateTime.UtcNow
            });
        }
    }
}
