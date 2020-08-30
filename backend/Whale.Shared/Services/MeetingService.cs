using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Whale.Shared.Helpers;
using Whale.Shared.Services.Abstract;
using Whale.DAL;
using Whale.Shared.Exceptions;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Participant;
using Whale.Shared.Models.Meeting.MeetingMessage;
using shortid;

namespace Whale.Shared.Services
{
    public class MeetingService : BaseService
    {
        private const string meetingSettingsPrefix = "meeting-settings-";
        private readonly RedisService _redisService;
        private readonly UserService _userService;
        private readonly ParticipantService _participantService;
        private readonly EncryptHelper _encryptService;
        private readonly SignalrService _signalrService;
        private readonly NotificationsService _notifications;

        public MeetingService(
            WhaleDbContext context,
            IMapper mapper,
            RedisService redisService,
            UserService userService,
            ParticipantService participantService,
            EncryptHelper encryptService,
            SignalrService signalrService,
            NotificationsService notifications)
            : base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
            _participantService = participantService;
            _encryptService = encryptService;
            _signalrService = signalrService;
            _notifications = notifications;
        }

        public async Task<MeetingDTO> ConnectToMeeting(MeetingLinkDTO linkDTO, string userEmail)
        {
            await _redisService.ConnectAsync();
            var redisDTO = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(linkDTO.Id.ToString());
            if (redisDTO.Password != linkDTO.Password)
                throw new InvalidCredentials();

            var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == linkDTO.Id);
            if (meeting == null)
                throw new NotFoundException("Meeting");

            if ((await _participantService.GetMeetingParticipantByEmail(meeting.Id, userEmail)) == null)
            {
                await _participantService.CreateParticipantAsync(new ParticipantCreateDTO
                {
                    Role = ParticipantRole.Participant,
                    UserEmail = userEmail,
                    MeetingId = meeting.Id
                });
            }

            var meetingSettings = await _redisService.GetAsync<MeetingSettingsDTO>($"{meetingSettingsPrefix}{linkDTO.Id}");

            var meetingDTO = _mapper.Map<MeetingDTO>(meeting);
            meetingDTO.Participants = (await _participantService.GetMeetingParticipantsAsync(meeting.Id)).ToList();
            meetingDTO.IsAudioAllowed = meetingSettings.IsAudioAllowed;
            meetingDTO.IsVideoAllowed = meetingSettings.IsVideoAllowed;

            return meetingDTO;
        }

        public async Task<MeetingLinkDTO> CreateMeeting(MeetingCreateDTO meetingDTO)
        {
            var meeting = _mapper.Map<Meeting>(meetingDTO);
            if (!meeting.IsScheduled)
            {
                meeting.StartTime = DateTimeOffset.Now;
            }

            await _context.Meetings.AddAsync(meeting);
            await _context.SaveChangesAsync();

            await _redisService.ConnectAsync();

            var pwd = _encryptService.EncryptString(Guid.NewGuid().ToString());
            await _redisService.SetAsync(meeting.Id.ToString(), new MeetingMessagesAndPasswordDTO { Password = pwd });
            await _redisService.SetAsync($"{meetingSettingsPrefix}{meeting.Id}", new MeetingSettingsDTO
            {
                IsAudioAllowed = meetingDTO.IsAudioAllowed,
                IsVideoAllowed = meetingDTO.IsVideoAllowed
            });

            string shortURL = ShortId.Generate();
            string fullURL = $"?id={meeting.Id}&pwd={pwd}";
            await _redisService.SetAsync(fullURL, shortURL);
            await _redisService.SetAsync(shortURL, fullURL);

            await _participantService.CreateParticipantAsync(new ParticipantCreateDTO
            {
                Role = ParticipantRole.Host,
                UserEmail = meetingDTO.CreatorEmail,
                MeetingId = meeting.Id
            });

            return new MeetingLinkDTO { Id = meeting.Id, Password = pwd };
        }

        public async Task UpdateMeetingMediaOnStart(MediaOnStartDTO mediaDTO)
        {
            await _redisService.ConnectAsync();

            var meetingSettings = 
                await _redisService.GetAsync<MeetingSettingsDTO>($"{meetingSettingsPrefix}{mediaDTO.MeetingId}");

            meetingSettings.IsVideoAllowed = mediaDTO.IsVideoAllowed;
            meetingSettings.IsAudioAllowed = mediaDTO.IsAudioAllowed;

            await _redisService.SetAsync($"{meetingSettingsPrefix}{mediaDTO.MeetingId}", meetingSettings);
        }

        public async Task<MeetingMessageDTO> SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var message = _mapper.Map<MeetingMessageDTO>(msgDTO);
            message.SentDate = DateTimeOffset.Now;
            message.Id = Guid.NewGuid().ToString();

            var user = await _userService.GetUserByEmail(msgDTO.AuthorEmail);
            message.Author = user ?? throw new NotFoundException("User");

            if (!string.IsNullOrEmpty(msgDTO.ReceiverEmail))
            {
                var receiver = await _userService.GetUserByEmail(msgDTO.ReceiverEmail);
                message.Receiver = receiver ?? throw new NotFoundException("User");
            }

            await _redisService.ConnectAsync();
            var redisDTO = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(msgDTO.MeetingId);
            redisDTO.Messages.Add(message);
            await _redisService.SetAsync(msgDTO.MeetingId, redisDTO);

            return message;
        }

        public async Task<IEnumerable<MeetingMessageDTO>> GetMessagesAsync(string groupName, string userEmail)
        {
            await _redisService.ConnectAsync();
            var redisDTO = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(groupName);
            return  redisDTO.Messages
                .Where(m => m.Receiver == null || m.Author.Email == userEmail || m.Receiver.Email == userEmail);
        }

        public async Task ParticipantDisconnect(string groupname, string userEmail)
        {
            var participant = await _participantService.GetMeetingParticipantByEmail(Guid.Parse(groupname), userEmail);
            if (participant == null)
                throw new NotFoundException("Participant");
        }

        public async Task EndMeeting(Guid meetingId)
        {
            var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == meetingId);

            if (meeting == null)
            {
                throw new NotFoundException(nameof(Meeting));
            }

            await _redisService.ConnectAsync();
            var redisMeetingData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(meetingId.ToString());
            await _redisService.RemoveAsync(meetingId.ToString());

            string fullURL = $"?id={meetingId}&pwd={redisMeetingData.Password}";
            var shortUrl = await _redisService.GetAsync<string>(fullURL);
            await _redisService.RemoveAsync(fullURL);
            await _redisService.RemoveAsync(shortUrl);
            await _redisService.RemoveAsync($"{meetingSettingsPrefix}{meetingId}");

            meeting.EndTime = DateTimeOffset.Now;
            _context.Update(meeting);

            await _context.SaveChangesAsync();
            await _notifications.UpdateInviteMeetingNotifications(shortUrl);
        }

        public async Task<string> GetShortInviteLink(string id, string pwd)
        {
            await _redisService.ConnectAsync();
            return await _redisService.GetAsync<string>($"?id={id}&pwd={pwd}");
        }

        public async Task<string> GetFullInviteLink(string shortURL)
        {
            await _redisService.ConnectAsync();
            return await _redisService.GetAsync<string>(shortURL);
        }
    }
}
