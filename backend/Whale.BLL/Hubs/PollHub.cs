using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.DTO.Poll;

namespace Whale.BLL.Hubs
{
	public class PollHub: Hub
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
