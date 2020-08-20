using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Services;
using Whale.SignalR.Models.Call;

namespace Whale.SignalR.Hubs
{
    public sealed class ChatHub : Hub
    {
        private readonly MeetingService _meetingService;
        private readonly ContactsService _contactsService;

        public ChatHub(MeetingService meetingService, ContactsService contactsService)
        {
            _meetingService = meetingService;
            _contactsService = contactsService;
        }

        [HubMethodName("JoinGroup")]
        public async Task Join(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("JoinedGroup", Context.ConnectionId);
        }

        [HubMethodName("NewMessageReceived")]
        public async Task SendMessage(DirectMessageDTO directMessageDTO)
        {
            await Clients.Group(directMessageDTO.ContactId.ToString()).SendAsync("NewMessageReceived", directMessageDTO);
        }


        public async Task Disconnect(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }
    }
}