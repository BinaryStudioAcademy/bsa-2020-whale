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

        [HubMethodName("OnStartCall")]
        public async Task StartCall(StartCallDTO startCallDTO)
        {
            var contact = await _contactsService.GetContactAsync(startCallDTO.ContactId, startCallDTO.Meeting.CreatorEmail);
            var link = await _meetingService.CreateMeeting(startCallDTO.Meeting);
            
            await Groups.AddToGroupAsync(Context.ConnectionId, startCallDTO.ContactId.ToString());
            await Clients.OthersInGroup(startCallDTO.ContactId.ToString()).SendAsync("OnStartCallOthers", new CallDTO { MeetingLink = link, Contact = contact, CallerEmail = startCallDTO.Meeting.CreatorEmail });
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