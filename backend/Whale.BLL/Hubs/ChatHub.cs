using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Whale.DAL;

namespace Whale.BLL.Hubs
{
    public sealed class ChatHub : Hub
    {
        [HubMethodName("JoinGroup")]
        public async Task Join(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("JoinedGroup", Context.ConnectionId);
        }

        public async Task Disconnect(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }

    }
}