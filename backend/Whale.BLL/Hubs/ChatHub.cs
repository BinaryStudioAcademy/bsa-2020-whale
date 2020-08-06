using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Whale.DAL;

namespace Whale.BLL.Hubs
{
    public sealed class ChatHub : Hub
    {



        public async Task Join(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " joined group");
        }

        public async Task SendMessage(string msg, string groupName)
        {
            await Clients.Group(groupName).SendAsync(msg);
        }

        public async Task Disconnect(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }
            
    }
}
