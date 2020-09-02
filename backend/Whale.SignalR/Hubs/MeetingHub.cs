using Microsoft.AspNetCore.SignalR;
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
using Whale.Shared.Models.Question;
using Whale.SignalR.Models.Reaction;
using Whale.DAL.Models.Poll;

namespace Whale.SignalR.Hubs
{
    public class MeetingHub : Hub
    {
        private const string meetingSettingsPrefix = "meeting-settings-";
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
            await _redisService.ConnectAsync();
            ParticipantDTO participant;
            if (connectionData.IsRoom)
            {
                var roomData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(connectionData.MeetingId);
                if (roomData is null) throw new NotFoundException("Room");

                var participantGroup = _groupsParticipants.FirstOrDefault((keyValuepair) => keyValuepair.Value.Any(p => p.User.Email == connectionData.UserEmail));
                if (participantGroup.Equals(default(KeyValuePair<string, List<Participant>>))) throw new NotFoundException(nameof(Participant));
                participant = participantGroup.Value.First(p => p.User.Email == connectionData.UserEmail);

                connectionData = configureConnectionData(connectionData, participant);
                var meetingData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(roomData.MeetingId);
                await Clients.Group(roomData.MeetingId).SendAsync("OnParticipantConnectRoom", connectionData);
                foreach (var roomId in meetingData.RoomsIds)
                {
                    await Clients.Group(roomId).SendAsync("OnParticipantConnectRoom", connectionData);
                }
            }
            else
            {
                participant = await _participantService.GetMeetingParticipantByEmail(
                    Guid.Parse(connectionData.MeetingId), connectionData.UserEmail);
                connectionData = configureConnectionData(connectionData, participant);
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, connectionData.MeetingId);

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

            if (connectionData.IsRoom)
            {

            }
         
            await Clients.Group(connectionData.MeetingId).SendAsync("OnUserConnect", connectionData);
            await Clients.Caller.SendAsync("OnParticipantConnect", _groupsParticipants[connectionData.MeetingId]);
        }

        private MeetingConnectDTO configureConnectionData(MeetingConnectDTO connectionData, ParticipantDTO participant)
        {
            participant.StreamId = connectionData.StreamId;
            connectionData.Participant = participant;
            connectionData.Participant.ActiveConnectionId = Context.ConnectionId;
            return connectionData;
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
                await Clients.Group(mediaState.MeetingId.ToString()).SendAsync("OnMediaStateChanged", mediaState);
            }
            else
            {
                await Clients.Client(mediaState.ReceiverConnectionId).SendAsync("OnMediaStateChanged", mediaState);
            }
        }

        [HubMethodName("OnParticipantStreamChanged")]
        public async Task ParticipantStreamChanged(StreamChangedDTO streamChangedData)
        {
            var participantInGroup = _groupsParticipants[streamChangedData.MeetingId.ToString()];
          
            var currentParticipant = participantInGroup
                .First(p => p.ActiveConnectionId == Context.ConnectionId);

            currentParticipant.StreamId = streamChangedData.NewStreamId;

                await Clients.Group(streamChangedData.MeetingId.ToString()).SendAsync("OnParticipantStreamChanged", streamChangedData);
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
            var isCallerHost = _groupsParticipants[mediaPermissions.MeetingId.ToString()]
                .Any(p => p.ActiveConnectionId == Context.ConnectionId && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(mediaPermissions.MeetingId.ToString()).SendAsync("OnMediaPermissionsChanged", mediaPermissions);
        }

        [HubMethodName("OnHostChangeMeetingSetting")]
        public async Task MeetingSettingChangeByHost(UpdateSettingsDTO updateSettings)
        {
            var isCallerHost = _groupsParticipants[updateSettings.MeetingId.ToString()]
                .Any(p => p.ActiveConnectionId == Context.ConnectionId && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(updateSettings.MeetingId.ToString()).SendAsync("OnHostChangeMeetingSetting", updateSettings);
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
        public async Task OnConferenceStartRecording(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnConferenceStartRecording");
        }

        [HubMethodName("OnConferenceStopRecording")]
        public async Task OnConferenceStopRecording(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnConferenceStopRecording");
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
            var participantHost = _groupsParticipants[roomCreateData.MeetingId]?.FirstOrDefault(p => p.ActiveConnectionId == Context.ConnectionId);
            if (participantHost?.Role == ParticipantRole.Participant) return;

            var roomId = Guid.NewGuid().ToString();
            await _redisService.ConnectAsync();
            await _redisService.SetAsync(roomId, new MeetingMessagesAndPasswordDTO { Password = "", IsRoom = true, MeetingId = roomCreateData.MeetingId });
            var meeetingData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(roomCreateData.MeetingId);
            meeetingData.RoomsIds.Add(roomId);
            await _redisService.SetAsync(roomCreateData.MeetingId, meeetingData);
            var meetingSettings = await _redisService.GetAsync<MeetingSettingsDTO>($"{meetingSettingsPrefix}{roomCreateData.MeetingId}");
            await _redisService.SetAsync($"{meetingSettingsPrefix}{roomId}", new MeetingSettingsDTO
            {
                MeetingHostEmail = participantHost.User.Email,
                IsAudioAllowed = true,
                IsVideoAllowed = true,
                IsWhiteboard = false,
                IsAllowedToChooseRoom = meetingSettings.IsAllowedToChooseRoom,
                IsPoll = false
            });

            _groupsParticipants.Add(roomId, new List<ParticipantDTO>());

            await Clients.Caller.SendAsync("OnRoomCreatedToHost", roomId);

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
            await _redisService.ConnectAsync();
            var roomsIds = (await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(meetingId)).RoomsIds;
            var rooms = new List<RoomDTO>();

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

        [HubMethodName("GetMeetingEntityForRoom")]
        public async Task<MeetingDTO> GetMeetingEntityForRoom(string roomId)
        {
            _redisService.Connect();
            var roomData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(roomId);
            if (roomData is null) throw new NotFoundException("Room");

            var roomSettings = await _redisService.GetAsync<MeetingSettingsDTO>(meetingSettingsPrefix + roomId);

            return new MeetingDTO
            {
                Id = Guid.Parse(roomId),
                IsVideoAllowed = roomSettings.IsVideoAllowed,
                IsAudioAllowed = roomSettings.IsAudioAllowed,
                IsWhiteboard = roomSettings.IsWhiteboard,
                IsPoll = roomSettings.IsPoll,
                IsAllowedToChooseRoom = roomSettings.IsAllowedToChooseRoom,
                Participants = new List<ParticipantDTO>(),
                PollResults = new List<PollResultDTO>()
            };
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

        [HubMethodName("QuestionCreate")]
        public async Task SendCreatedQuestion(QuestionDTO questionDto)
        {
            await Clients.Group(questionDto.MeetingId.ToString()).SendAsync("QuestionCreate", questionDto);
        }

        [HubMethodName("QuestionStatusUpdate")]
        public async Task SendQuestionStatusUpdate(QuestionStatusUpdateDTO questionStatusUpdate)
        {
            await Clients.Group(questionStatusUpdate.MeetingId.ToString())
                .SendAsync("QuestionStatusUpdate", questionStatusUpdate);
        }

        [HubMethodName("QuestionDelete")]
        public async Task SendDeletedQuestionId(QuestionDeleteDTO questionDelete)
        {
            await Clients.Group(questionDelete.MeetingId.ToString())
                .SendAsync("QuestionDelete", questionDelete);
        }

        [HubMethodName("OnReaction")]
        public async Task SendReaction(ReactionDTO reaction)
        {
            await Clients.Group(reaction.MeetingId).SendAsync("OnReaction", reaction);
        }
    }
}
