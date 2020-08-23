using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.Meeting;
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

        public WhaleHub(WhaleService whaleService, MeetingService meetingService, ContactsService contactsService, GroupService groupsService)
        {
            _whaleService = whaleService;
            _meetingService = meetingService;
            _contactsService = contactsService;
            _groupsService = groupsService;
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

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = await _whaleService.UserDisconnectOnError(Context.ConnectionId);
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
            foreach(var connection in connections)
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
            var userToCall = groupUsers.Where(x => x.Email != startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeeting(startCallDTO.Meeting);
            foreach (var usr in userToCall) {
                var connections = await _whaleService.GetConnections(usr.Id);
                foreach (var connection in connections)
                {
                    await Clients.Client(connection).SendAsync("OnStartCallOthers", new GroupCallDTO { MeetingLink = link, Group = group, CallerEmail = startCallDTO.Meeting.CreatorEmail });
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
    }
}
