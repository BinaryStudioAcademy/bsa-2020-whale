using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Meeting.MeetingMessage;
using Whale.BLL.Interfaces;
using Whale.Shared.DTO.Poll;
using Whale.BLL.Services;

namespace Whale.BLL.Hubs
{
    public class MeetingHub : Hub
    {
        private readonly IMeetingService _meetingService;
        private readonly ParticipantService _participantService;

        public MeetingHub(IMeetingService meetingService, ParticipantService participantService)
        {
            _meetingService = meetingService;
            _participantService = participantService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task Join(MeetingConnectDTO connectionData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            var participant = await _participantService.GetMeetingParticipantByEmail(Guid.Parse(connectionData.MeetingId), connectionData.UserEmail);
            connectionData.Participant = participant;
            await Clients.Group(connectionData.MeetingId).SendAsync("OnUserConnect", connectionData);
            await Clients.Caller.SendAsync("OnParticipantConnect", participant);
        }

        [HubMethodName("OnUserDisconnect")]
        public async Task Disconnect(MeetingConnectDTO ConnectionData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConnectionData.MeetingId);
            await Clients.Group(ConnectionData.MeetingId).SendAsync("OnUserDisconnect", ConnectionData);
            //if (await _meetingService.ParticipantDisconnect(ConnectionData.MeetingId, ConnectionData.UserEmail))
            //{
            //    await Clients.Group(ConnectionData.MeetingId).SendAsync("OnMeetingEnded", ConnectionData);
            //}
        }

        [HubMethodName("SendGroupMessage")]
        public async Task SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var msg = _meetingService.SendMessage(msgDTO);
            await Clients.Group(msgDTO.MeetingId).SendAsync("SentMessage", msg);
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
