using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.Shared.Models.GroupMessage;
using Whale.Shared.Models.DirectMessage;

namespace Whale.SignalR.Hubs
{
    public sealed class ChatHub : Hub
    {
        [HubMethodName("JoinGroup")]
        public async Task JoinAsync(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("JoinedGroup", Context.ConnectionId);
        }

        [HubMethodName("LeaveGroup")]
        public async Task LeaveAsync(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("LeftGroup", Context.ConnectionId);
        }

        [HubMethodName("NewMessageReceived")]
        public async Task SendMessageAsync(DirectMessageDTO directMessageDTO)
        {
            await Clients.Group(directMessageDTO.ContactId.ToString()).SendAsync("NewMessageReceived", directMessageDTO);
        }

        [HubMethodName("NewGroupMessageReceived")]
        public async Task SendGroupMessageAsync(GroupMessageDTO groupMessageDTO)
        {
            await Clients.Group(groupMessageDTO.GroupId.ToString()).SendAsync("NewGroupMessageReceived", groupMessageDTO);
        }

        public async Task DisconnectAsync(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }
    }
}