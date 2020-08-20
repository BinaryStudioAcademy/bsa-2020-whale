using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Services;

namespace Whale.SignalR.Hubs
{
    public class WhaleHub : Hub
    {
        private readonly WhaleService _whaleService;

        public WhaleHub(WhaleService whaleService)
        {
            _whaleService = whaleService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task UserConnect(string userEmail)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            var userOnline = await _whaleService.UserConnect(userEmail, Context.ConnectionId);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserConnect", userOnline);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task UserDisconnect(string userEmail)
        {
            await _whaleService.UserDisconnect(userEmail, Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserDisconnect", userEmail);
        }
    }
}
