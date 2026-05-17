using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace server.Presentation.Hubs
{
    [Authorize]
    public sealed class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            // Here we could add users to specific groups if needed, 
            // but SignalR already allows sending to a specific User via Context.UserIdentifier
            await base.OnConnectedAsync();
        }
    }
}
