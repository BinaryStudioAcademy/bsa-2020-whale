using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Whale.BLL.Hubs
{
    public sealed class ChatHub : Hub
    {
        public async Task SendMessage(string msg)
        {
            await Clients.All.SendAsync("SendMessage", msg);
        }
    }
}
