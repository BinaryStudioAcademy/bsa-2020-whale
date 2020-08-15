using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Meeting.MeetingMessage;
using Whale.BLL.Interfaces;
using Whale.Shared.DTO.Poll;
using Whale.BLL.Services;
using Whale.Shared.DTO.Participant;

namespace Whale.BLL.Hubs
{
    public class MeetingHub : Hub
    {
        private readonly IMeetingService _meetingService;
        private readonly ParticipantService _participantService;
        private readonly static Dictionary<string, List<ParticipantDTO>> _participants = 
            new Dictionary<string, List<ParticipantDTO>>();

        public MeetingHub(IMeetingService meetingService, ParticipantService participantService)
        {
            _meetingService = meetingService;
            _participantService = participantService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task Join(MeetingConnectDTO connectionData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            var participant = await _participantService.GetMeetingParticipantByEmail(
                Guid.Parse(connectionData.MeetingId), connectionData.UserEmail);
            participant.StreamId = connectionData.StreamId;
            connectionData.Participant = participant;

            if (_participants.TryGetValue(connectionData.MeetingId, out var groupParticipants))
            {
                groupParticipants.Add(participant);
            }
            else
            {
                _participants[connectionData.MeetingId] = new List<ParticipantDTO> { participant };
            }
         
            await Clients.Group(connectionData.MeetingId).SendAsync("OnUserConnect", connectionData);
            await Clients.Caller.SendAsync("OnParticipantConnect", _participants[connectionData.MeetingId]);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task Disconnect(MeetingConnectDTO ConnectionData)
        {
            var disconnectedParticipant = _participants[ConnectionData.MeetingId].Find(p => p.Id == ConnectionData.Participant.Id);
            _participants[ConnectionData.MeetingId].Remove(disconnectedParticipant);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConnectionData.MeetingId);
            await Clients.Group(ConnectionData.MeetingId).SendAsync("OnUserDisconnect", ConnectionData);

            if (await _meetingService.ParticipantDisconnect(ConnectionData.MeetingId, ConnectionData.UserEmail))
            {
                await Clients.Group(ConnectionData.MeetingId).SendAsync("OnMeetingEnded", ConnectionData);
            }
        }

        [HubMethodName("OnSendMessage")]
        public async Task SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var msg = await _meetingService.SendMessage(msgDTO);
            await Clients.Group(msgDTO.MeetingId).SendAsync("OnSendMessage", msg);
        }

        [HubMethodName("OnGetMessages")]
        public async Task GetMessages(string groupName)
        {
            var messages = await _meetingService.GetMessagesAsync(groupName);
            await Clients.Caller.SendAsync("OnGetMessages", messages);
        }

        [HubMethodName("OnConferenceStartRecording")]
        public async Task OnConferenceStartRecording(string message)
        {
            await Clients.All.SendAsync("OnConferenceStartRecording", message);
        }

        [HubMethodName("OnConferenceStopRecording")]
        public async Task OnConferenceStopRecording(string message)
        {
            await Clients.All.SendAsync("OnConferenceStopRecording", message);
        }

        [HubMethodName("OnPollCreated")]
        public async Task SendPollToGroup(PollDataDTO pollData)
        {
            await Clients.Group(pollData.GroupId).SendAsync("OnPoll", pollData.PollDto);
        }
    }
}
