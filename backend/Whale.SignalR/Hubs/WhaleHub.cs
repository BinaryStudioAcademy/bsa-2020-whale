using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Whale.DAL.Models;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.Group;
using Whale.Shared.Models.Group.GroupUser;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Notification;
using Whale.Shared.Services;
using Whale.SignalR.Models.Call;

namespace Whale.SignalR.Hubs
{
    public class WhaleHub : Hub
    {
        private readonly WhaleService _whaleService;
        private readonly MeetingService _meetingService;
        private readonly ContactsService _contactsService;
        private readonly GroupService _groupsService;
        private readonly UserService _userService;


        public WhaleHub(WhaleService whaleService, MeetingService meetingService, UserService userService, ContactsService contactsService, GroupService groupsService)
        {
            _whaleService = whaleService;
            _meetingService = meetingService;
            _contactsService = contactsService;
            _groupsService = groupsService;
            _userService = userService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task UserConnect(string userEmail)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userEmail);
            await Groups.AddToGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            var userOnline = await _whaleService.UserConnect(userEmail, Context.ConnectionId);
            await Clients.GroupExcept(WhaleService.OnlineUsersKey, Context.ConnectionId).SendAsync("OnUserConnect", userOnline);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task UserDisconnect(string userEmail)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEmail);
            await _whaleService.UserDisconnect(userEmail);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserDisconnect", userEmail);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = await _whaleService.UserDisconnectOnError(Context.ConnectionId);
            var userEmail = Context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (userEmail is object)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEmail);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserDisconnectOnError", userId);
            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("OnStartCall")]
        public async Task StartCall(StartCallDTO startCallDTO)
        {
            var contact = await _contactsService.GetContactAsync(startCallDTO.ContactId, startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeeting(startCallDTO.Meeting);
            var connections = await _whaleService.GetConnections(contact.SecondMember.Id);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnStartCallOthers", new CallDTO { MeetingLink = link, Contact = contact, CallerEmail = startCallDTO.Meeting.CreatorEmail });
            }
            await Clients.Caller.SendAsync("OnStartCallCaller", link);
        }

        [HubMethodName("OnStartGroupCall")]
        public async Task StartGroupCall(StartGroupCallDTO startCallDTO)
        {
            var group = await _groupsService.GetGroupAsync(startCallDTO.GroupId, startCallDTO.Meeting.CreatorEmail);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(startCallDTO.GroupId);
            var usersToCall = groupUsers.Where(x => x.Email != startCallDTO.Meeting.CreatorEmail);
            var creator = groupUsers.FirstOrDefault(x => x.Email == startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeeting(startCallDTO.Meeting);
            foreach (var usr in usersToCall)
            {
                var connections = await _whaleService.GetConnections(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnStartCallOthersInGroup", new GroupCallDTO { MeetingLink = link, Group = group, Caller  = creator });
                }
            }
            await Clients.Caller.SendAsync("OnStartCallCaller", link);
        }

        [HubMethodName("OnTakeCall")]
        public async Task TakeCall(Guid userId)
        {
            var connections = await _whaleService.GetConnections(userId);
            await Clients.Client(connections.LastOrDefault()).SendAsync("OnTakeCall");
        }

        [HubMethodName("OnTakeGroupCall")]
        public async Task TakeGroupCall(Guid groupId)
        {
            var group = await _groupsService.GetGroupAsync(groupId);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(group.Id);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnections(usr.Id);
                await Clients.Client(connections.LastOrDefault()).SendAsync("OnTakeGroupCall");
            }
        }

        [HubMethodName("OnDeclineCall")]
        public async Task DeclineCall(DeclineCallDTO declineCallDTO)
        {
            await _meetingService.ParticipantDisconnect(declineCallDTO.MeetingId, declineCallDTO.Email);
            var connections = await _whaleService.GetConnections(declineCallDTO.UserId);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnDeclineCall");
            }
        }

        [HubMethodName("OnDeclineGroupCall")]
        public async Task DeclineGroupCall(DeclineGroupCallDTO declineCallDTO)
        {
            await _meetingService.ParticipantDisconnect(declineCallDTO.MeetingId, declineCallDTO.CallCreator.Email);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(declineCallDTO.GroupId);
            var isUserCaller = groupUsers.FirstOrDefault(x => x.Email == declineCallDTO.CallCreator.Email);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnections(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnDeclineGroupCall", declineCallDTO);
                }
            }
        }

        [HubMethodName("onNewNotification")]
        public Task NewNotification(string userEmail, NotificationDTO notificationDTO)
        {
            return Clients.Group(userEmail).SendAsync("onNewNotification", notificationDTO);
        }

        [HubMethodName("onDeleteNotification")]
        public Task DeleteNotification(string userEmail, Guid notificationId)
        {
            return Clients.Group(userEmail).SendAsync("onDeleteNotification", notificationId);
        }

        [HubMethodName("onUpdateNotification")]
        public Task UpdateNotification(string userEmail, NotificationDTO notificationDTO)
        {
            return Clients.Group(userEmail).SendAsync("onUpdateNotification", notificationDTO);
        }

        [HubMethodName("onNewContact")]
        public Task NewContact(ContactDTO contactDTO)
        {
            return Clients.Group(contactDTO.FirstMember.Email).SendAsync("onNewContact", contactDTO);
        }
        [HubMethodName("onDeleteContact")]
        public async Task DeleteContact(Contact contact)
        {
            await Clients.Group(contact.FirstMember.Email).SendAsync("onDeleteContact", contact.Id);
            await Clients.Group(contact.SecondMember.Email).SendAsync("onDeleteContact", contact.Id);
        }

        [HubMethodName("OnNewGroup")]
        public async Task NewGroup(GroupDTO groupDTO, Guid userId)
        {
            var group = await _groupsService.GetGroupAsync(groupDTO.Id, groupDTO.CreatorEmail);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(groupDTO.Id);
            var userToNotify = groupUsers.Where(x => x.Email != groupDTO.CreatorEmail);
            var connections = await _whaleService.GetConnections(userId);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnNewGroup", groupDTO);
            }
        }

        [HubMethodName("OnGroupUpdate")]
        public async Task UpdateGroup(GroupDTO groupDTO)
        {
            var group = await _groupsService.GetGroupAsync(groupDTO.Id);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(group.Id);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnections(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnGroupUpdate", groupDTO);
                }
            }
        }

        [HubMethodName("OnDeleteGroup")]
        public async Task DeleteGroup(Guid groupDTO, IEnumerable<GroupUser> groupUsers)
        {
            var _groupUsers = groupUsers;
            foreach (var usr in _groupUsers)
            {
                var connections = await _whaleService.GetConnections(usr.UserId);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnDeleteGroup", groupDTO);
                }
            }
        }

        [HubMethodName("OnRemovedFromGroup")]
        public async Task RemoveFromGroup(DeleteUserFromGroupDTO userGroup)
        {
            var group = await _groupsService.GetGroupAsync(userGroup.GroupId);
            var userInGroup = await _userService.GetUserByEmail(userGroup.UserEmail);
            var connections = await _whaleService.GetConnections(userInGroup.Id);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnRemovedFromGroup", group.Id);
                await Groups.RemoveFromGroupAsync(connection, userGroup.GroupId.ToString());
            }
        }


    }
}
