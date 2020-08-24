using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Whale.DAL.Models;
using Whale.Shared.Models.Contact;
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

        public WhaleHub(WhaleService whaleService, MeetingService meetingService, ContactsService contactsService)
        {
            _whaleService = whaleService;
            _meetingService = meetingService;
            _contactsService = contactsService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task UserConnect(string userEmail)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userEmail);
            await Groups.AddToGroupAsync(Context.ConnectionId, WhaleService.OnlineUsersKey);
            var userOnline = await _whaleService.UserConnect(userEmail, Context.ConnectionId);
            await Clients.Group(WhaleService.OnlineUsersKey).SendAsync("OnUserConnect", userOnline);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task UserDisconnect(string userEmail)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEmail);
            await _whaleService.UserDisconnect(userEmail, Context.ConnectionId);
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
            foreach(var connection in connections)
            {
                await Clients.Client(connection).SendAsync("OnStartCallOthers", new CallDTO { MeetingLink = link, Contact = contact, CallerEmail = startCallDTO.Meeting.CreatorEmail });
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
    }
}
