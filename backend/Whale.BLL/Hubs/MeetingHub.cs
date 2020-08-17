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
using System.Linq;

namespace Whale.BLL.Hubs
{
    public class MeetingHub : Hub
    {
        private readonly IMeetingService _meetingService;
        private readonly ParticipantService _participantService;
        private readonly static Dictionary<string, List<ParticipantDTO>> _groupsParticipants = 
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
            connectionData.Participant.ActiveConnectionId = Context.ConnectionId;

            if (_groupsParticipants.TryGetValue(connectionData.MeetingId, out var groupParticipants))
            {
                groupParticipants.Add(participant);
            }
            else
            {
                _groupsParticipants[connectionData.MeetingId] = new List<ParticipantDTO> { participant };
            }
         
            await Clients.Group(connectionData.MeetingId).SendAsync("OnUserConnect", connectionData);
            await Clients.Caller.SendAsync("OnParticipantConnect", _groupsParticipants[connectionData.MeetingId]);
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            var disconectedParticipantInGroups = _groupsParticipants
                .Where(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId))
                .ToList();

            foreach(var group in disconectedParticipantInGroups)
            {
                var disconnectedParticipant = group.Value.Find(p => p.ActiveConnectionId == Context.ConnectionId);

                _groupsParticipants[group.Key].Remove(disconnectedParticipant);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, group.Key);
                await Clients.Group(group.Key).SendAsync("OnParticipantDisconnected", disconnectedParticipant);
            }

            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("OnParticipantLeft")]
        public async Task ParticipantLeft(MeetingConnectDTO ConnectionData)
        {
            var disconnectedParticipant = _groupsParticipants[ConnectionData.MeetingId].Find(p => p.Id == ConnectionData.Participant.Id);

            ConnectionData.Participant = disconnectedParticipant;
            _groupsParticipants[ConnectionData.MeetingId].Remove(disconnectedParticipant);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConnectionData.MeetingId);
            await Clients.Group(ConnectionData.MeetingId).SendAsync("OnParticipantLeft", ConnectionData);

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

<<<<<<< HEAD
        [HubMethodName("OnPollCreated")]
        public async Task SendPollToGroup(PollDataDTO pollData)
        {
            await Clients.Group(pollData.GroupId).SendAsync("OnPoll", pollData.PollDto);
=======
        [HubMethodName("OnDrawing")]
        public async Task Draw(CreateDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId }).SendAsync("OnDrawing", drawingDTO.CanvasEvent);
        }

        [HubMethodName("OnErasing")]
        public async Task Erase(EraseDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId }).SendAsync("OnErasing", drawingDTO.Erase);
>>>>>>> feature/whiteboard
        }
    }
}
