using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
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
using Whale.Shared.Models.User;
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

        public WhaleHub(
            WhaleService whaleService,
            MeetingService meetingService,
            UserService userService,
            ContactsService contactsService,
            GroupService groupsService)
        {
            _whaleService = whaleService;
            _meetingService = meetingService;
            _contactsService = contactsService;
            _groupsService = groupsService;
            _userService = userService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task UserConnectAsync(string userEmail)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userEmail);
            await Groups.AddToGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            var userOnline = await _whaleService.UserConnectAsync(userEmail, Context.ConnectionId);
            await Clients.GroupExcept(WhaleService.OnlineUsersKey, Context.ConnectionId).SendAsync("OnUserConnect", userOnline);
        }

        [HubMethodName("OnUpdateUserState")]
        public async Task UpdateUserState(UserOnlineDTO userOnline)
        {
            await Clients.GroupExcept(WhaleService.OnlineUsersKey, Context.ConnectionId).SendAsync("OnUpdateUserState", userOnline);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task UserDisconnectAsync(string userEmail)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEmail);
            await _whaleService.UserDisconnectAsync(userEmail);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserDisconnect", userEmail);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = await _whaleService.UserDisconnectOnErrorAsync(Context.ConnectionId);
            var userEmail = Context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (userEmail is object)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEmail);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserDisconnectOnError", userId);
            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("OnStartCall")]
        public async Task StartCallAsync(StartCallDTO startCallDTO)
        {
            var contact = await _contactsService.GetContactAsync(startCallDTO.ContactId, startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeetingAsync(startCallDTO.Meeting);
            var connections = await _whaleService.GetConnectionsAsync(contact.SecondMember.Id);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnStartCallOthers", new CallDTO { MeetingLink = link, Contact = contact, CallerEmail = startCallDTO.Meeting.CreatorEmail });
            }
            await Clients.Caller.SendAsync("OnStartCallCaller", link);
        }

        [HubMethodName("OnStartGroupCall")]
        public async Task StartGroupCallAsync(StartGroupCallDTO startCallDTO)
        {
            var group = await _groupsService.GetGroupAsync(startCallDTO.GroupId, startCallDTO.Meeting.CreatorEmail);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(startCallDTO.GroupId);
            var usersToCall = groupUsers.Where(x => x.Email != startCallDTO.Meeting.CreatorEmail);
            var creator = groupUsers.FirstOrDefault(x => x.Email == startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeetingAsync(startCallDTO.Meeting);
            foreach (var usr in usersToCall)
            {
                var connections = await _whaleService.GetConnectionsAsync(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnStartCallOthersInGroup", new GroupCallDTO { MeetingLink = link, Group = group, Caller  = creator });
                }
            }

            await Clients.Caller.SendAsync("OnStartCallCaller", link);
        }

        [HubMethodName("OnTakeCall")]
        public async Task TakeCallAsync(Guid userId)
        {
            var connections = await _whaleService.GetConnectionsAsync(userId);
            await Clients.Client(connections.LastOrDefault()).SendAsync("OnTakeCall");
        }

        [HubMethodName("OnTakeGroupCall")]
        public async Task TakeGroupCallAsync(Guid groupId)
        {
            var group = await _groupsService.GetGroupAsync(groupId);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(group.Id);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnectionsAsync(usr.Id);
                await Clients.Client(connections.LastOrDefault()).SendAsync("OnTakeGroupCall");
            }
        }

        [HubMethodName("OnDeclineCall")]
        public async Task DeclineCallAsync(DeclineCallDTO declineCallDTO)
        {
            await _meetingService.ParticipantDisconnectAsync(declineCallDTO.MeetingId, declineCallDTO.Email);
            var connections = await _whaleService.GetConnectionsAsync(declineCallDTO.UserId);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnDeclineCall");
            }
        }

        [HubMethodName("OnDeclineGroupCall")]
        public async Task DeclineGroupCallAsync(DeclineGroupCallDTO declineCallDTO)
        {
            await _meetingService.ParticipantDisconnectAsync(declineCallDTO.MeetingId, declineCallDTO.CallCreator.Email);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(declineCallDTO.GroupId);
            var isUserCaller = groupUsers.FirstOrDefault(x => x.Email == declineCallDTO.CallCreator.Email);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnectionsAsync(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnDeclineGroupCall", declineCallDTO);
                }
            }
        }

        [HubMethodName("onNewNotification")]
        public Task NewNotificationAsync(string userEmail, NotificationDTO notificationDTO)
        {
            return Clients.Group(userEmail).SendAsync("onNewNotification", notificationDTO);
        }

        [HubMethodName("onDeleteNotification")]
        public Task DeleteNotificationAsync(string userEmail, Guid notificationId)
        {
            return Clients.Group(userEmail).SendAsync("onDeleteNotification", notificationId);
        }

        [HubMethodName("onUpdateNotification")]
        public Task UpdateNotificationAsync(string userEmail, NotificationDTO notificationDTO)
        {
            return Clients.Group(userEmail).SendAsync("onUpdateNotification", notificationDTO);
        }

        [HubMethodName("onNewContact")]
        public Task NewContact(ContactDTO contactDTO)
        {
            return Clients.Group(contactDTO.FirstMember.Email).SendAsync("onNewContact", contactDTO);
        }
        [HubMethodName("onDeleteContact")]
        public async Task DeleteContactAsync(Contact contact)
        {
            await Clients.Group(contact.FirstMember.Email).SendAsync("onDeleteContact", contact.Id);
            await Clients.Group(contact.SecondMember.Email).SendAsync("onDeleteContact", contact.Id);
        }

        [HubMethodName("OnNewGroup")]
        public async Task NewGroupAsync(GroupDTO groupDTO, Guid userId)
        {
            var group = await _groupsService.GetGroupAsync(groupDTO.Id, groupDTO.CreatorEmail);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(groupDTO.Id);
            var userToNotify = groupUsers.Where(x => x.Email != groupDTO.CreatorEmail);
            var connections = await _whaleService.GetConnectionsAsync(userId);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnNewGroup", groupDTO);
            }
        }

        [HubMethodName("OnGroupUpdate")]
        public async Task UpdateGroupAsync(GroupDTO groupDTO)
        {
            var group = await _groupsService.GetGroupAsync(groupDTO.Id);
            var groupUsers = await _groupsService.GetAllUsersInGroupAsync(group.Id);
            foreach (var usr in groupUsers)
            {
                var connections = await _whaleService.GetConnectionsAsync(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnGroupUpdate", groupDTO);
                }
            }
        }

        [HubMethodName("OnDeleteGroup")]
        public async Task DeleteGroupAsync(Guid groupDTO, IEnumerable<GroupUser> groupUsers)
        {
            foreach (var user in groupUsers)
            {
                var connections = await _whaleService.GetConnectionsAsync(user.UserId);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnDeleteGroup", groupDTO);
                }
            }
        }

        [HubMethodName("OnRemovedFromGroup")]
        public async Task RemoveFromGroupAsync(DeleteUserFromGroupDTO userGroup)
        {
            var group = await _groupsService.GetGroupAsync(userGroup.GroupId);
            var userInGroup = await _userService.GetUserByEmailAsync(userGroup.UserEmail);
            var connections = await _whaleService.GetConnectionsAsync(userInGroup.Id);
            foreach (var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnRemovedFromGroup", group.Id);
                await Groups.RemoveFromGroupAsync(connection, userGroup.GroupId.ToString());
            }
        }

        [HubMethodName("SignalMeetingEnd")]
        public async Task OnMeetingEnd(string userEmail, string meeting)
        {
            await Clients.Group(userEmail).SendAsync("OnMeetingEnd", meeting);
        }
    }
}
