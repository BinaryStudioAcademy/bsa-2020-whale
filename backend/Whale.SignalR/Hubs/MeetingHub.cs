﻿using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Whale.Shared.Services;
using Whale.Shared.Models.Participant;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Meeting.MeetingMessage;
using Whale.Shared.Models.Poll;
using Whale.SignalR.Models.Drawing;
using Whale.SignalR.Models.Media;
using Whale.DAL.Models;
using Whale.Shared.Exceptions;
using Whale.SignalR.Services;
using Whale.SignalR.Models.Room;
using Whale.SignalR.Models.Reaction;

namespace Whale.SignalR.Hubs
{
    public class MeetingHub : Hub
    {
        private readonly MeetingService _meetingService;
        private readonly ParticipantService _participantService;
        private readonly RedisService _redisService;
        private readonly UserService _userService;
        private readonly RoomService _roomService;
        private readonly MeetingHttpService _meetingHttpService;
        private readonly static Dictionary<string, List<ParticipantDTO>> _groupsParticipants = 
            new Dictionary<string, List<ParticipantDTO>>();

        public MeetingHub(MeetingService meetingService, 
            ParticipantService participantService, 
            RedisService redisService, 
            UserService userService, 
            RoomService roomService,
            MeetingHttpService meetingHttpService)
        {
            _meetingService = meetingService;
            _participantService = participantService;
            _redisService = redisService;
            _userService = userService;
            _roomService = roomService;
            _meetingHttpService = meetingHttpService;
        }

        [HubMethodName("OnUserConnect")]
        public async Task Join(MeetingConnectDTO connectionData)
        {
            ParticipantDTO participant;
            if (connectionData.IsRoom)
            {
                await _redisService.ConnectAsync();
                if (await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(connectionData.MeetingId) is null) throw new NotFoundException("Room");

                var participantGroup = _groupsParticipants.FirstOrDefault((keyValuepair) => keyValuepair.Value.Any(p => p.User.Email == connectionData.UserEmail));
                if (participantGroup.Equals(default(KeyValuePair<string, List<Participant>>))) throw new NotFoundException(nameof(Participant));
                participant = participantGroup.Value.First(p => p.User.Email == connectionData.UserEmail);
            }
            else
            {
                participant = await _participantService.GetMeetingParticipantByEmail(
                    Guid.Parse(connectionData.MeetingId), connectionData.UserEmail);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, connectionData.MeetingId);

            participant.StreamId = connectionData.StreamId;
            connectionData.Participant = participant;
            connectionData.Participant.ActiveConnectionId = Context.ConnectionId;

            if (_groupsParticipants.TryGetValue(connectionData.MeetingId, out var groupParticipants))
            {
                var existingParticipant = groupParticipants.FirstOrDefault(p => p.User.Id == participant.User.Id);
                if (existingParticipant is null)
                {
                    groupParticipants.Add(participant);
                } else
                {
                    var participantIndex = groupParticipants.IndexOf(existingParticipant);
                    groupParticipants[participantIndex] = participant;
                }
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
                if(group.Value.Count <= 0)
                {
                    await this.DeleteMeeting(group.Key);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("OnParticipantLeft")]
        public async Task ParticipantLeft(MeetingConnectDTO connectionData)
        {
            var disconectedParticipantInGroups = _groupsParticipants
                    .Where(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId))
                    .ToList();

            foreach (var group in disconectedParticipantInGroups)
            {
                var disconnectedParticipant = group.Value.Find(p => p.ActiveConnectionId == Context.ConnectionId);

                connectionData.Participant = disconnectedParticipant;
                _groupsParticipants[group.Key].Remove(disconnectedParticipant);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, group.Key);
                await Clients.Group(group.Key).SendAsync("OnParticipantLeft", connectionData);
                if (group.Value.Count <= 0)
                {
                    await this.DeleteMeeting(group.Key);
                }
            }
        }


        [HubMethodName("OnMediaStateChanged")]
        public async Task ParticipantMediaStateChanged(MediaStateDTO mediaState)
        {
            if (string.IsNullOrEmpty(mediaState.ReceiverConnectionId))
            {
                var participantInGroup = _groupsParticipants
                    .FirstOrDefault(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId));

                await Clients.Group(participantInGroup.Key).SendAsync("OnMediaStateChanged", mediaState);
            }
            else
            {
                await Clients.Client(mediaState.ReceiverConnectionId).SendAsync("OnMediaStateChanged", mediaState);
            }
        }

        [HubMethodName("OnParticipantStreamChanged")]
        public async Task ParticipantStreamChanged(StreamChangedDTO streamChangedData)
        {
            var participantInGroup = _groupsParticipants
                    .FirstOrDefault(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId));

            if (EqualityComparer<KeyValuePair<string, List<ParticipantDTO>>>.Default.Equals(participantInGroup, default))
                return;
          
            var currentParticipant = participantInGroup
                .Value
                .First(p => p.ActiveConnectionId == Context.ConnectionId);

            currentParticipant.StreamId = streamChangedData.NewStreamId;

                await Clients.Group(participantInGroup.Key).SendAsync("OnParticipantStreamChanged", streamChangedData);
        }

        [HubMethodName("OnMediaStateRequested")]
        public async Task ParticipantMediaStateRequested(string connectionId)
        {
            await Clients.Client(connectionId)
                .SendAsync("OnMediaStateRequested", Context.ConnectionId);
        }

        [HubMethodName("OnMediaPermissionsChanged")]
        public async Task MediaPermissionsChangeByHost(MediaPermissionsChangeDTO mediaPermissions)
        {
            var participantInGroup = _groupsParticipants
              .First(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId));

            var isCallerHost = participantInGroup
                .Value
                .Any(p => p.ActiveConnectionId == Context.ConnectionId
                    && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(participantInGroup.Key).SendAsync("OnMediaPermissionsChanged", mediaPermissions);
        }

        [HubMethodName("OnHostChangeMeetingSetting")]
        public async Task MeetingSettingChangeByHost(UpdateSettingsDTO updateSettings)
        {
            var participantInGroup = _groupsParticipants
              .First(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId));

            var isCallerHost = participantInGroup
                .Value
                .Any(p => p.ActiveConnectionId == Context.ConnectionId
                    && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(participantInGroup.Key).SendAsync("OnHostChangeMeetingSetting", updateSettings);
        }

        [HubMethodName("OnPollResults")]
        public async Task PollResults(string groupName, PollResultDTO pollResult)
        {
            await Clients.Group(groupName).SendAsync("OnPollResults", pollResult);
        }

        [HubMethodName("OnPollDeleted")]
        public async Task PollResults(string groupName, string pollId)
        {
            await Clients.Group(groupName).SendAsync("OnPollDeleted", pollId);
        }

        [HubMethodName("OnSendMessage")]
        public async Task SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var msg = await _meetingService.SendMessage(msgDTO);
            if(msg.Receiver != null)
            {
                var receiver = _groupsParticipants[msgDTO.MeetingId].Find(p => p.User.Id == msg.Receiver.Id);
                if(receiver != null)
                {
                    await Clients.Caller.SendAsync("OnSendMessage", msg);
                    await Clients.Client(receiver.ActiveConnectionId).SendAsync("OnSendMessage", msg);
                }
            } else
            {
                await Clients.Group(msgDTO.MeetingId).SendAsync("OnSendMessage", msg);
            }
        }

        [HubMethodName("OnGetMessages")]
        public async Task GetMessages(GetMessagesDTO getMessagesDTO)
        {
            var messages = await _meetingService.GetMessagesAsync(getMessagesDTO.MeetingId, getMessagesDTO.Email);
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

        [HubMethodName("OnDrawing")]
        public async Task OnDrawing(CreateDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId })
                .SendAsync("OnDrawing", drawingDTO.CanvasEvent);
        }

        [HubMethodName("OnErasing")]
        public async Task OnErasing(EraseDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId })
                .SendAsync("OnErasing", drawingDTO.Erase);
        }

        [HubMethodName("OnDrawingChangePermissions")]
        public async Task OnDrawingChangePermissions(bool enabled)
        {
            var participantInGroup = _groupsParticipants
                .First(g => g.Value.Any(p => p.ActiveConnectionId == Context.ConnectionId));

            var isCallerHost = participantInGroup
                .Value
                .Any(p => p.ActiveConnectionId == Context.ConnectionId
                    && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(participantInGroup.Key).SendAsync("OnDrawingChangePermissions", enabled);
        }

        [HubMethodName("CreateRoom")]
        public async Task CreateRoom(RoomCreateDTO roomCreateData)
        {
            Console.WriteLine("CreateRoom");
            var participantHost = _groupsParticipants[roomCreateData.MeetingId]?.FirstOrDefault(p => p.ActiveConnectionId == Context.ConnectionId);
            if (participantHost?.Role == ParticipantRole.Participant) return;

            var roomId = Guid.NewGuid().ToString();
            await _redisService.ConnectAsync();
            await _redisService.SetAsync(roomId, new MeetingMessagesAndPasswordDTO { Password = "", IsRoom = true });
            var meeetingData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(roomCreateData.MeetingId);
            meeetingData.RoomsIds.Add(roomId);
            await _redisService.SetAsync(roomCreateData.MeetingId, meeetingData);

            _groupsParticipants.Add(roomId, new List<ParticipantDTO>());

            await Clients.Caller.SendAsync("OnRoomCreatedToHost", new RoomWithParticipantsIds { RoomId = roomId, ParticipantsIds = roomCreateData.ParticipantsIds});

            var participants = _groupsParticipants[roomCreateData.MeetingId]
                    .Where(p => roomCreateData.ParticipantsIds.Contains(p.Id.ToString()))
                    .Select(p => p.ActiveConnectionId)
                    .ToList();

            await Clients.Clients(participants).SendAsync("OnRoomCreated", roomId);

            _roomService.CloseRoomAfterTimeExpire(roomCreateData.Duration, roomCreateData.MeetingLink, roomId, roomCreateData.MeetingId, _groupsParticipants);
        }

        [HubMethodName("OnMoveIntoRoom")]
        public async Task OnMoveIntoRoom(MeetingConnectDTO connectionData)
        {
            var disconnectedParticipant = _groupsParticipants[connectionData.MeetingId]
                                            .Find(p => p.ActiveConnectionId == Context.ConnectionId);
            connectionData.Participant = disconnectedParticipant;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            await Clients.Group(connectionData.MeetingId).SendAsync("onParticipentMoveIntoRoom", connectionData);
        }

        [HubMethodName("GetCreatedRooms")]
        public async Task<ICollection<RoomDTO>> GetCreatedRooms(string meetingId)
        {
            var participantHost = _groupsParticipants[meetingId].FirstOrDefault(p => p.ActiveConnectionId == Context.ConnectionId);
            if (participantHost?.Role == ParticipantRole.Participant) throw new InvalidCredentials();

            await _redisService.ConnectAsync();
            var roomsIds = (await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(meetingId)).RoomsIds;
            var rooms = new List<RoomDTO>();
            var participants = _groupsParticipants[meetingId]?.ToList();

            foreach(var id in roomsIds)
            {
                rooms.Add(new RoomDTO
                {
                    RoomId = id,
                    Participants = _groupsParticipants[id]?.ToList()
                });
            }

            return rooms;
        }

        [HubMethodName("OnLeaveRoom")]
        public async Task OnParticipantLeaveRoom(MeetingConnectDTO connectionData)
        {
            var disconnectedParticipant = _groupsParticipants[connectionData.MeetingId]?.FirstOrDefault(p => p.User.Email == connectionData.UserEmail);

            connectionData.Participant = disconnectedParticipant;
            _groupsParticipants[connectionData.MeetingId].Remove(disconnectedParticipant);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            await Clients.Group(connectionData.MeetingId).SendAsync("OnParticipantLeft", connectionData);
        }

        private async Task DeleteMeeting(string meetingId)
        {
            await _redisService.ConnectAsync();
            var redisDto = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(meetingId);
            if (!redisDto.IsRoom)
            {
                _groupsParticipants.Remove(meetingId);
                await _meetingService.EndMeeting(Guid.Parse(meetingId));
                await _meetingHttpService.DeleteMeetingPolls(meetingId);
            }
        }

        [HubMethodName("OnStartShareScreen")]
        public async Task OnStartShare(ShareScreenDTO share)
        {
            await Clients.Group(share.meetingId).SendAsync("OnStartShareScreen",share.streamId);
        }

        [HubMethodName("OnStopShareScreen")]
        public async Task OnStopShare(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnStopShareScreen");
        }

        [HubMethodName("OnReaction")]
        public async Task SendReaction(ReactionDTO reaction)
        {
            await Clients.Group(reaction.MeetingId).SendAsync("OnReaction", reaction);
        }   
    }
}
