using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.Shared.Models.GroupMessage;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Services;
using Whale.SignalR.Models.Call;
using System;
using Whale.Shared.Models.Group;
using System.Linq;
using Whale.DAL.Models;

namespace Whale.SignalR.Hubs
{
    public sealed class ChatHub : Hub
    {
        private readonly MeetingService _meetingService;
        private readonly ContactsService _contactsService;
        private readonly GroupService _groupsService;
        private readonly WhaleService _whaleService;
        private readonly UserService _userService;
        public ChatHub(MeetingService meetingService, ContactsService contactsService, GroupService groupsService, WhaleService whaleService, UserService userService)
        {
            _meetingService = meetingService;
            _contactsService = contactsService;
            _groupsService = groupsService;
            _userService = userService;
            _whaleService = whaleService;
        }

        [HubMethodName("JoinGroup")]
        public async Task Join(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("JoinedGroup", Context.ConnectionId);
        }

        [HubMethodName("LeaveGroup")]
        public async Task Leave(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("LeftGroup", Context.ConnectionId);
        }

        [HubMethodName("NewMessageReceived")]
        public async Task SendMessage(DirectMessageDTO directMessageDTO)
        {
            await Clients.Group(directMessageDTO.ContactId.ToString()).SendAsync("NewMessageReceived", directMessageDTO);
        }

        [HubMethodName("NewGroupMessageReceived")]
        public async Task SendGroupMessage(GroupMessageDTO groupMessageDTO)
        {
            await Clients.Group(groupMessageDTO.GroupId.ToString()).SendAsync("NewGroupMessageReceived", groupMessageDTO);
        }

        public async Task Disconnect(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }
    }
}