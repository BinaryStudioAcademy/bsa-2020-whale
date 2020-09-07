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
using Whale.SignalR.Models.Agenda;

namespace Whale.SignalR.Hubs
{
    public class MeetingHub : Hub
    {
        private const string meetingSettingsPrefix = "meeting-settings-";
        private const string roomNamePrefix = "name-";
        private readonly MeetingService _meetingService;
        private readonly ParticipantService _participantService;
        private readonly RedisService _redisService;
        private readonly UserService _userService;
        private readonly RoomService _roomService;
        private readonly MeetingHttpService _meetingHttpService;
        private static readonly Dictionary<string, string> _connectionWithMeeting = new Dictionary<string, string>();

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
                var roomData = await _redisService.GetAsync<MeetingRedisData>(connectionData.MeetingId);
                if (roomData is null) throw new NotFoundException("Room");

                var mainMeetingData = await _redisService.GetAsync<MeetingRedisData>(roomData.MeetingId);

                participant = mainMeetingData.Participants.First(p => p.User.Email == connectionData.UserEmail);
                if (participant is null) throw new NotFoundException(nameof(Participant));

                _connectionWithMeeting.Remove(Context.ConnectionId);
                _connectionWithMeeting.Add(Context.ConnectionId, roomData.MeetingId);
                connectionData = ConfigureConnectionData(connectionData, participant);
                await Clients.Group(roomData.MeetingId).SendAsync("OnParticipantConnectRoom", connectionData);
                foreach (var roomId in mainMeetingData.RoomsIds)
                {
                    await Clients.Group(roomId).SendAsync("OnParticipantConnectRoom", connectionData);
                }
            }
            else
            {
                participant = await _participantService.GetMeetingParticipantByEmail(
                    Guid.Parse(connectionData.MeetingId), connectionData.UserEmail);
                connectionData = ConfigureConnectionData(connectionData, participant);
                _connectionWithMeeting.Remove(Context.ConnectionId);
                _connectionWithMeeting.Add(Context.ConnectionId, connectionData.MeetingId);
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, connectionData.MeetingId);

            var meetingData = await _redisService.GetAsync<MeetingRedisData>(connectionData.MeetingId);
            var participantOfMeeting = meetingData.Participants.FirstOrDefault(p => p.User.Id == participant.User.Id);
            if(participantOfMeeting is null)
            {
                meetingData.Participants.Add(participant);
            } else
            {
                meetingData.Participants = meetingData.Participants.Select(p =>
                {
                    if (p.User.Id == participant.User.Id)
                    {
                        return participant;
                    }
                    return p;
                }).ToList();
            }

            await _redisService.SetAsync(connectionData.MeetingId, meetingData);

            await Clients.Group(connectionData.MeetingId).SendAsync("OnUserConnect", connectionData);
            await Clients.Caller.SendAsync("OnParticipantConnect", meetingData.Participants);
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            var meetingId = _connectionWithMeeting[Context.ConnectionId];
            _connectionWithMeeting.Remove(Context.ConnectionId);

            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(meetingId);

            var disconnectedParticipant = meetingData.Participants.First(p => p.ActiveConnectionId == Context.ConnectionId);
            meetingData.Participants.Remove(disconnectedParticipant);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, meetingId);
            await Clients.Group(meetingId).SendAsync("OnParticipantDisconnected", disconnectedParticipant);
            await _redisService.SetAsync(meetingId, meetingData);

            if (meetingData.IsRoom)
            {
                meetingData = await _redisService.GetAsync<MeetingRedisData>(meetingData.MeetingId);

                disconnectedParticipant = meetingData.Participants.FirstOrDefault(p => p.ActiveConnectionId == Context.ConnectionId);
                meetingData.Participants.Remove(disconnectedParticipant);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, meetingData.MeetingId);
                await Clients.Group(meetingData.MeetingId).SendAsync("OnParticipantDisconnected", disconnectedParticipant);

                await _redisService.SetAsync(meetingData.MeetingId, meetingData);
            }

            if (meetingData.Participants.Count == 0)
            {
                await DeleteMeetingAsync(meetingId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("OnParticipantLeft")]
        public async Task ParticipantLeftAsync(MeetingConnectDTO connectionData)
        {
            _connectionWithMeeting.Remove(Context.ConnectionId);
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(connectionData.MeetingId);

            var disconnectedParticipant = meetingData.Participants.FirstOrDefault(p => p.Id == connectionData.Participant.Id);
            connectionData.Participant = disconnectedParticipant;
            meetingData.Participants = meetingData.Participants.Where(p => p.Id != connectionData.Participant.Id).ToList();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            await Clients.Group(connectionData.MeetingId).SendAsync("OnParticipantLeft", connectionData);
            await _redisService.SetAsync(connectionData.MeetingId, meetingData);

            if (meetingData.IsRoom)
            {
                meetingData = await _redisService.GetAsync<MeetingRedisData>(meetingData.MeetingId);

                disconnectedParticipant = meetingData.Participants.FirstOrDefault(p => p.Id == connectionData.Participant.Id);
                connectionData.MeetingId = meetingData.MeetingId;
                connectionData.IsRoom = false;
                connectionData.Participant = disconnectedParticipant;
                meetingData.Participants = meetingData.Participants.Where(p => p.Id != connectionData.Participant.Id).ToList();
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
                await Clients.Group(connectionData.MeetingId).SendAsync("OnParticipantLeft", connectionData);

                await _redisService.SetAsync(connectionData.MeetingId, meetingData);
            }

            if (meetingData.Participants.Count == 0)
            {
                await DeleteMeetingAsync(connectionData.MeetingId);
            }
        }

        [HubMethodName("OnMediaStateChanged")]
        public async Task ParticipantMediaStateChangedAsync(MediaStateDTO mediaState)
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
        public async Task ParticipantStreamChangedAsync(StreamChangedDTO streamChangedData)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(streamChangedData.MeetingId.ToString());

            var currentParticipant = meetingData.Participants
                .First(p => p.ActiveConnectionId == Context.ConnectionId);

            currentParticipant.StreamId = streamChangedData.NewStreamId;

            await Clients.Group(streamChangedData.MeetingId.ToString()).SendAsync("OnParticipantStreamChanged", streamChangedData);
        }

        [HubMethodName("OnMediaStateRequested")]
        public async Task ParticipantMediaStateRequestedAsync(string connectionId)
        {
            await Clients.Client(connectionId)
                .SendAsync("OnMediaStateRequested", Context.ConnectionId);
        }

        [HubMethodName("OnMediaPermissionsChanged")]
        public async Task MediaPermissionsChangeByHostAsync(MediaPermissionsChangeDTO mediaPermissions)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(mediaPermissions.MeetingId.ToString());

            var isCallerHost = meetingData.Participants
                .Any(p => p.ActiveConnectionId == Context.ConnectionId && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(mediaPermissions.MeetingId.ToString()).SendAsync("OnMediaPermissionsChanged", mediaPermissions);
        }

        [HubMethodName("OnHostChangeMeetingSetting")]
        public async Task MeetingSettingChangeByHostAsync(UpdateSettingsDTO updateSettings)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(updateSettings.MeetingId.ToString());

            var isCallerHost = meetingData.Participants
                .Any(p => p.ActiveConnectionId == Context.ConnectionId && p.Role == ParticipantRole.Host);

            if (!isCallerHost)
                return;

            await Clients.Group(updateSettings.MeetingId.ToString()).SendAsync("OnHostChangeMeetingSetting", updateSettings);
        }

        [HubMethodName("OnPollResults")]
        public async Task PollResultsAsync(string groupName, PollResultDTO pollResult)
        {
            await Clients.Group(groupName).SendAsync("OnPollResults", pollResult);
        }

        [HubMethodName("OnPollDeleted")]
        public async Task PollResultsAsync(string groupName, string pollId)
        {
            await Clients.Group(groupName).SendAsync("OnPollDeleted", pollId);
        }

        [HubMethodName("OnSendMessage")]
        public async Task SendMessageAsync(MeetingMessageCreateDTO msgDTO)
        {
            var msg = await _meetingService.SendMessageAsync(msgDTO);
            if (msg.Receiver != null)
            {
                await _redisService.ConnectAsync();
                var meetingData = await _redisService.GetAsync<MeetingRedisData>(msgDTO.MeetingId);

                var receiver = meetingData.Participants.FirstOrDefault(p => p.User.Id == msg.Receiver.Id);
                if (receiver != null)
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
        public async Task GetMessagesAsync(GetMessagesDTO getMessagesDTO)
        {
            var messages = await _meetingService.GetMessagesAsync(getMessagesDTO.MeetingId, getMessagesDTO.Email);
            await Clients.Caller.SendAsync("OnGetMessages", messages);
        }

        [HubMethodName("OnConferenceStartRecording")]
        public async Task OnConferenceStartRecordingAsync(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnConferenceStartRecording");
        }

        [HubMethodName("OnConferenceStopRecording")]
        public async Task OnConferenceStopRecordingAsync(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnConferenceStopRecording");
        }

        [HubMethodName("OnPollCreated")]
        public async Task SendPollToGroupAsync(PollDataDTO pollData)
        {
            await Clients.Group(pollData.GroupId).SendAsync("OnPoll", pollData.PollDto);
        }

        [HubMethodName("OnDrawing")]
        public async Task OnDrawingAsync(CreateDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId })
                .SendAsync("OnDrawing", drawingDTO.CanvasEvent);
        }

        [HubMethodName("OnErasing")]
        public async Task OnErasingAsync(EraseDrawingDTO drawingDTO)
        {
            await Clients.GroupExcept(drawingDTO.MeetingId, new List<string> { Context.ConnectionId })
                .SendAsync("OnErasing", drawingDTO.Erase);
        }

        [HubMethodName("CreateRoom")]
        public async Task CreateRoomAsync(RoomCreateDTO roomCreateData)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(roomCreateData.MeetingId);

            var participantHost = meetingData.Participants.FirstOrDefault(p => p.ActiveConnectionId == Context.ConnectionId);
            if (participantHost?.Role == ParticipantRole.Participant) return;

            var roomId = Guid.NewGuid().ToString();
            await _redisService.ConnectAsync();
            await _redisService.SetAsync(roomId, new MeetingRedisData { Password = "", IsRoom = true, MeetingId = roomCreateData.MeetingId });

            var meeetingData = await _redisService.GetAsync<MeetingRedisData>(roomCreateData.MeetingId);
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

            await _redisService.SetAsync(roomNamePrefix + roomId, roomCreateData.RoomName);

            await Clients.Caller.SendAsync("OnRoomCreatedToHost", new RoomDTO
            {
                RoomId = roomId,
                Name = roomCreateData.RoomName
            });

            var participants = meetingData.Participants
                    .Where(p => roomCreateData.ParticipantsIds.Contains(p.Id.ToString()))
                    .Select(p => p.ActiveConnectionId)
                    .ToList();

            await Clients.Clients(participants).SendAsync("OnRoomCreated", roomId);

            _roomService.CloseRoomAfterTimeExpire(roomCreateData.Duration, roomCreateData.MeetingLink, roomId, roomCreateData.MeetingId);
        }

        [HubMethodName("OnMoveIntoRoom")]
        public async Task OnMoveIntoRoomAsync(MeetingConnectDTO connectionData)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(connectionData.MeetingId);
            connectionData.Participant = meetingData.Participants
                .First(p => p.ActiveConnectionId == Context.ConnectionId);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            await Clients.Group(connectionData.MeetingId).SendAsync("onParticipentMoveIntoRoom", connectionData);
        }

        [HubMethodName("GetCreatedRooms")]
        public async Task<ICollection<RoomDTO>> GetCreatedRoomsAsync(string meetingId)
        {
            await _redisService.ConnectAsync();
            var roomsIds = (await _redisService.GetAsync<MeetingRedisData>(meetingId)).RoomsIds;
            var rooms = new List<RoomDTO>();

            foreach (var id in roomsIds)
            {
                var roomName = await _redisService.GetAsync<string>(roomNamePrefix + id);
                var roomData = await _redisService.GetAsync<MeetingRedisData>(id);
                rooms.Add(new RoomDTO
                {
                    RoomId = id,
                    Name = roomName,
                    Participants = roomData.Participants
                });
            }

            return rooms;
        }

        [HubMethodName("GetMeetingEntityForRoom")]
        public async Task<MeetingDTO> GetMeetingEntityForRoomAsync(string roomId)
        {
            _redisService.Connect();
            var roomData = await _redisService.GetAsync<MeetingRedisData>(roomId);
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
                RecognitionLanguage = roomSettings.RecognitionLanguage,
                Recurrence = roomSettings.Recurrence,
                Participants = new List<ParticipantDTO>(),
                PollResults = new List<PollResultDTO>()
            };
        }

        [HubMethodName("OnLeaveRoom")]
        public async Task OnParticipantLeaveRoomAsync(MeetingConnectDTO connectionData)
        {
            await _redisService.ConnectAsync();
            var meetingData = await _redisService.GetAsync<MeetingRedisData>(connectionData.MeetingId);
            var disconnectedParticipant = meetingData?.Participants?.FirstOrDefault(p => p.User.Email == connectionData.UserEmail);
            meetingData.Participants.Remove(disconnectedParticipant);

            connectionData.Participant = disconnectedParticipant;
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connectionData.MeetingId);
            await Clients.Group(connectionData.MeetingId).SendAsync("OnParticipantLeft", connectionData);
            await _redisService.SetAsync(connectionData.MeetingId, meetingData);
        }

        private async Task DeleteMeetingAsync(string meetingId)
        {
            await _redisService.ConnectAsync();
            var redisDto = await _redisService.GetAsync<MeetingRedisData>(meetingId);
            if (!redisDto.IsRoom)
            {
                await _meetingService.EndMeetingAsync(Guid.Parse(meetingId));
                await _meetingHttpService.DeleteMeetingPolls(meetingId);
            }
        }

        [HubMethodName("OnStartShareScreen")]
        public async Task OnStartShareAsync(ShareScreenDTO share)
        {
            await Clients.Group(share.MeetingId).SendAsync("OnStartShareScreen", share.StreamId);
        }

        [HubMethodName("OnStopShareScreen")]
        public async Task OnStopShareAsync(string meetingId)
        {
            await Clients.Group(meetingId).SendAsync("OnStopShareScreen");
        }

        [HubMethodName("QuestionCreate")]
        public async Task SendCreatedQuestionAsync(QuestionDTO questionDto)
        {
            await Clients.Group(questionDto.MeetingId.ToString()).SendAsync("QuestionCreate", questionDto);
        }

        [HubMethodName("QuestionStatusUpdate")]
        public async Task SendQuestionStatusUpdateAsync(QuestionStatusUpdateDTO questionStatusUpdate)
        {
            await Clients.Group(questionStatusUpdate.MeetingId.ToString())
                .SendAsync("QuestionStatusUpdate", questionStatusUpdate);
        }

        [HubMethodName("QuestionDelete")]
        public async Task SendDeletedQuestionIdasync(QuestionDeleteDTO questionDelete)
        {
            await Clients.Group(questionDelete.MeetingId.ToString())
                .SendAsync("QuestionDelete", questionDelete);
        }

        [HubMethodName("OnReaction")]
        public async Task SendReactionasync(ReactionDTO reaction)
        {
            await Clients.Group(reaction.MeetingId).SendAsync("OnReaction", reaction);
        }

        [HubMethodName("OnSpeechRecognition")]
        public Task SpeechRecognition(MeetingSpeechCreateDTO speechDTO)
        {
            return _meetingService.SpeechRecognitionAsync(speechDTO);
        }

        [HubMethodName("OnEndedTopic")]
        public async Task CheckPointAsEndedAsync(AgendaSignal sign)
        {
            await Clients.Group(sign.MeetingId).SendAsync("OnEndedTopic",sign.Point);
        }

        [HubMethodName("OnOutTime")]
        public async Task CheckRunningOutAsync(AgendaSignal sign)
        {
            await Clients.Group(sign.MeetingId).SendAsync("OnOutTime", sign.Point);
        }

        [HubMethodName("OnSnoozeTopic")]
        public async Task SnoozeTopicAsync(AgendaSignal sign)
        {
            await Clients.Group(sign.MeetingId).SendAsync("OnSnoozeTopic", sign.Point);
        }

        private MeetingConnectDTO ConfigureConnectionData(MeetingConnectDTO connectionData, ParticipantDTO participant)
        {
            participant.StreamId = connectionData.StreamId;
            connectionData.Participant = participant;
            connectionData.Participant.ActiveConnectionId = Context.ConnectionId;
            return connectionData;
        }
    }
}
