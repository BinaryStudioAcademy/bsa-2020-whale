using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Whale.BLL.Services.Abstract;
using Whale.BLL.Services.Interfaces;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.Meeting.ScheduledMeeting;

namespace Whale.BLL.Services
{
    public class ScheduledMeetingsService:BaseService, IScheduledMeetingsService
    {
        public ScheduledMeetingsService(WhaleDbContext context, IMapper mapper)
            : base(context, mapper) { }

        public async Task<ScheduledMeetingDTO> GetAsync(Guid uid)
        {
            Console.WriteLine("1");
            var meeting = await _context.Meetings
                .Where(m => m.IsRecurrent && m.IsScheduled)
                .FirstOrDefaultAsync(s => s.Id == uid);
            if (meeting is null)
                throw new Exception("Scheduled Meeting not found");

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }
        public async Task<ScheduledMeetingDTO> PostAsync(ScheduledMeetingCreateDTO scheduledMeeting)
        {
            var newMeeting = _mapper.Map<Meeting>(scheduledMeeting);
            _context.Meetings.Add(newMeeting);
            await _context.SaveChangesAsync();

            return await GetAsync(newMeeting.Id);
        }
        public async Task<ScheduledMeetingDTO> UpdateAsync(ScheduledMeetingDTO scheduledMeeting)
        {
            var meeting = _context.Meetings.FirstOrDefault(m => m.Id == scheduledMeeting.Id);

            if (meeting is null) throw new Exception("Scheduled Meeting not found");

            meeting.Settings = scheduledMeeting.Settings;
            meeting.StartTime = scheduledMeeting.ScheduledTime;
            meeting.AnonymousCount = scheduledMeeting.AnonymousCount;
            await _context.SaveChangesAsync();

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }
        public async Task DeleteAsync(Guid id)
        {
            var meeting = _context.Meetings.FirstOrDefault(c => c.Id == id);

            if (meeting is null) throw new Exception("Scheduled Meeting not found");

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();

            return;
        }
    }
}
