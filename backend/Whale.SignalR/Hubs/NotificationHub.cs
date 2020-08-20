using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Models.Notification;
using Whale.Shared.Services;
using Whale.SignalR.Models.Call;

namespace Whale.SignalR.Hubs
{
    public sealed class NotificationHub : Hub
    {

        [HubMethodName("onConect")]
        public async Task Join(string email)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, email);
        }

        [HubMethodName("onNewNotification")]
        public async Task SendNotification(string email, NotificationDTO notificationDTO)
        {
            await Clients.Group(email).SendAsync("onNewNotification", notificationDTO);
        }

        public async Task Disconnect(string email)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, email);
        }

    }
}