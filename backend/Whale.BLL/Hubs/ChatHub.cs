using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.BLL.Interfaces;
using Whale.BLL.Services.Interfaces;
using Whale.DAL;
using Whale.Shared.DTO.Call;

namespace Whale.BLL.Hubs
{
    public sealed class ChatHub : Hub
    {
        private readonly IMeetingService _meetingService;
        private readonly IContactsService _contactsService;

        public ChatHub(IMeetingService meetingService, IContactsService contactsService)
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

        public async Task Disconnect(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync(Context.ConnectionId + " jeft groupS");
        }

        [HubMethodName("OnStartCall")]
        public async Task StartCall(StartCallDTO startCallDTO)
        {
            var contact = await _contactsService.GetContactAsync(startCallDTO.ContactId, startCallDTO.Email);
            var link = await _meetingService.CreateMeeting(startCallDTO.Meeting, new List<string> { contact.FirstMember.Email, contact.SecondMember.Email });
            
            await Groups.AddToGroupAsync(Context.ConnectionId, startCallDTO.ContactId.ToString());
            await Clients.OthersInGroup(startCallDTO.ContactId.ToString()).SendAsync("OnStartCallOthers", new CallDTO { MeetingLink = link, Contact = contact, CallerEmail = startCallDTO.Email });
            await Clients.Caller.SendAsync("OnStartCallCaller", link);
        }

        [HubMethodName("OnTakeCall")]
        public async Task TakeCall(string groupName)
        {
            await Clients.OthersInGroup(groupName).SendAsync("OnTakeCall");
        }

        [HubMethodName("OnDeclineCall")]
        public async Task DeclineCall(DeclineCallDTO declineCallDTO)
        {
            await _meetingService.ParticipantDisconnect(declineCallDTO.MeetingId, declineCallDTO.Email);
            await Clients.OthersInGroup(declineCallDTO.ContactId).SendAsync("OnDeclineCall");
        }
    }
}