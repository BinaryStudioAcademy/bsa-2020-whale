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

namespace Whale.BLL.Services
{
    public class MeetingService : BaseService, IMeetingService
    {
        private readonly RedisService _redisService;

        public MeetingService(WhaleDbContext context, IMapper mapper, RedisService redisService) : base(context, mapper)
        {
            _redisService = redisService;
        }

        public async Task<MeetingDTO> ConnectToMeeting(MeetingLinkDTO linkDTO)
        {
            _redisService.Connect();
            var password =  _redisService.Get<string>(linkDTO.Id.ToString());
            if (password != linkDTO.Password)
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
            _redisService.Set(meeting.Id.ToString(), pwd);

            return new MeetingLinkDTO { Id = meeting.Id, Password = pwd };
        }

        public MeetingMessageDTO SendMessage(MeetingMessageCreateDTO msgDTO)
        {
            var message = _mapper.Map<MeetingMessageDTO>(msgDTO);
            message.SentDate = DateTime.Now;
            message.Id = Guid.NewGuid();
            _redisService.Connect();
            _redisService.Set(message.Id.ToString(), message);

            return message;
        }

    }
}
