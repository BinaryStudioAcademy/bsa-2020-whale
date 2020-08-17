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
        private readonly RedisService _redisService;
        private readonly UserService _userService;
        private readonly ParticipantService _participantService;
        private readonly EncryptHelper _encryptService;

        public MeetingService(WhaleDbContext context, IMapper mapper, RedisService redisService, UserService userService, ParticipantService participantService, EncryptHelper encryptService)
            : base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
            _participantService = participantService;
            _encryptService = encryptService;
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

            var meetingDTO = _mapper.Map<MeetingDTO>(meeting);
            meetingDTO.Participants = (await _participantService.GetMeetingParticipantsAsync(meeting.Id)).ToList();

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

        public async Task<MeetingMessageDTO> SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var message = _mapper.Map<MeetingMessageDTO>(msgDTO);
            message.SentDate = DateTimeOffset.Now;
            message.Id = Guid.NewGuid().ToString();

            var user = await _userService.GetUserByEmail(msgDTO.AuthorEmail);
            message.Author = user ?? throw new NotFoundException("User");

            await _redisService.ConnectAsync();
            var redisDTO = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(msgDTO.MeetingId);
            redisDTO.Messages.Add(message);
            await _redisService.SetAsync(msgDTO.MeetingId, redisDTO);

            return message;
        }

        public async Task<IEnumerable<MeetingMessageDTO>> GetMessagesAsync(string groupName)
        {
            await _redisService.ConnectAsync();
            var redisDTO = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(groupName);
            return redisDTO.Messages;
        }

        public async Task<bool> ParticipantDisconnect(string groupname, string userEmail)
        {
            var participant = await _participantService.GetMeetingParticipantByEmail(Guid.Parse(groupname), userEmail);
            if (participant == null)
                throw new NotFoundException("Participant");

            var isHost = participant.Role == ParticipantRole.Host;
            if (isHost)
            {
                await _redisService.ConnectAsync();
                await _redisService.RemoveAsync(groupname);
            }
            return isHost;
        }

        public async Task<string> GetShortInviteLink(string fullURL)
        {
            await _redisService.ConnectAsync();

            return await _redisService.GetAsync<string>(fullURL);
        }

        public async Task<string> GetFullInviteLink(string shortURL)
        {
            await _redisService.ConnectAsync();

            return await _redisService.GetAsync<string>(shortURL);
        }
    }
}
