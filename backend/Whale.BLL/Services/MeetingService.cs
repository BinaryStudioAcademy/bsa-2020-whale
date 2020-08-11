using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;
using Whale.BLL.Interfaces;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Meeting.MeetingMessage;
using Whale.Shared.Services;
using Microsoft.AspNetCore.SignalR;
using Whale.BLL.Services.Interfaces;

namespace Whale.BLL.Services
{
    public class MeetingService : BaseService, IMeetingService
    {
        private readonly RedisService _redisService;
        private readonly IUserService _userService;

        public MeetingService(WhaleDbContext context, IMapper mapper, RedisService redisService, IUserService userService) : base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
        }

        public async Task<MeetingDTO> ConnectToMeeting(MeetingLinkDTO linkDTO)
        {
            _redisService.Connect();
            var redisDTO =  _redisService.Get<MeetingMessagesAndPasswordDTO>(linkDTO.Id.ToString());
            if (redisDTO.Password != linkDTO.Password)
                throw new InvalidCredentials();

            var meeting  = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == linkDTO.Id);
            if (meeting == null)
                throw new NotFoundException("Meeting");
  
            return _mapper.Map<MeetingDTO>(meeting);
        }

        public async Task<MeetingLinkDTO> CreateMeeting(MeetingCreateDTO meetingDTO)
        {
            var meeting = _mapper.Map<Meeting>(meetingDTO);
            if (!meeting.IsScheduled)
            {
                meeting.StartTime = DateTime.Now;
            }
            await _context.AddAsync(meeting);
            await _context.SaveChangesAsync();

            _redisService.Connect();

            var pwd = Guid.NewGuid().ToString();
            _redisService.Set(meeting.Id.ToString(), new MeetingMessagesAndPasswordDTO { Password = pwd });

            return new MeetingLinkDTO { Id = meeting.Id, Password = pwd };
        }

        public async Task<MeetingMessageDTO> SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var message = _mapper.Map<MeetingMessageDTO>(msgDTO);
            message.SentDate = DateTime.Now;
            message.Id = Guid.NewGuid().ToString();

            var user = await _userService.GetUserByEmail(msgDTO.AuthorEmail);
            message.Author = user ?? throw new NotFoundException("User");

            _redisService.Connect();
            var redisDTO = _redisService.Get<MeetingMessagesAndPasswordDTO>(msgDTO.MeetingId);
            redisDTO.Messages.Add(message);
            _redisService.Set(msgDTO.MeetingId, redisDTO);

            return message;
        }

        public IEnumerable<MeetingMessageDTO> GetMessages(string groupName)
        {
            _redisService.Connect();
            var redisDTO = _redisService.Get<MeetingMessagesAndPasswordDTO>(groupName);
            return redisDTO.Messages;
        }

    }
}
