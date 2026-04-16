using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using server.Application.Handlers.ConfirmStage;
using server.Application.Handlers.DeleteStage;
using server.Application.Handlers.ProposeStage;
using server.Application.Handlers.RejectStage;
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
            var senderId = GetUserId();

            var result = await _mediator.Send(
                new SendMessageCommand(
                    Guid.Parse(helpRequestId),
                    senderId,
                    content));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync(
                    "Error", 
                    result.Error.Code, 
                    result.Error.Message);
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

        //Stages coomunication methods
        public async Task ProposeStage(
            string helpRequestId,
            string chatId,
            string content)
        {
            var userId = GetUserId();

            var result = await _mediator.Send(
                new ProposeStageCommand(
                    Guid.Parse(helpRequestId),
                    Guid.Parse(chatId),
                    userId,
                    content));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync(
                    "Error",
                    result.Error.Code,
                    result.Error.Message);
                return;
            }

            await Clients.Group(helpRequestId).SendAsync("StageProposed", new
            {
                stageId = result.Value,
                proposedByUserId = userId,
                content,
                createdAtUtc = DateTime.UtcNow
            });
        }

        public async Task ConfirmStage(string helpRequestId, string stageId)
        {
            var userId = GetUserId();

            var result = await _mediator.Send(
                new ConfirmStageCommand(
                    Guid.Parse(stageId),
                    userId));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync(
                    "Error",
                    result.Error.Code,
                    result.Error.Message);
                return;
            }

            await Clients.Group(helpRequestId).SendAsync("StageConfirmed", new
            {
                stageId,
                confirmedByUserId = userId,
                resolvedAtUtc = DateTime.UtcNow
            });
        }

        public async Task RejectStage(
            string helpRequestId,
            string stageId,
            string reason)
        {
            var userId = GetUserId();

            var result = await _mediator.Send(
                new RejectStageCommand(
                    Guid.Parse(stageId),
                    userId,
                    reason));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync(
                    "Error",
                    result.Error.Code,
                    result.Error.Message);
                return;
            }

            await Clients.Group(helpRequestId).SendAsync("StageRejected", new
            {
                stageId,
                rejectedByUserId = userId,
                reason,
                resolvedAtUtc = DateTime.UtcNow
            });
        }

        public async Task DeleteStage(string helpRequestId, string stageId)
        {
            var userId = GetUserId();

            var result = await _mediator.Send(
                new DeleteStageCommand(
                    Guid.Parse(stageId),
                    userId));

            if (result.IsFailure)
            {
                await Clients.Caller.SendAsync(
                    "Error",
                    result.Error.Code,
                    result.Error.Message);
                return;
            }

            await Clients.Group(helpRequestId).SendAsync("StageDeleted", new
            {
                stageId,
                deletedByUserId = userId
            });
        }

        private Guid GetUserId() =>
            Guid.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
