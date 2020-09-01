using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Models.ScheduledMeeting;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Exceptions;
using Whale.Shared.Services.Abstract;

namespace Whale.API.Services
{
    public class ScheduledMeetingsService: BaseService
    {
        public ScheduledMeetingsService(WhaleDbContext context, IMapper mapper)
            : base(context, mapper) { }

        public async Task<ScheduledMeetingDTO> GetAsync(Guid uid)
        {
            var meeting = await _context.Meetings
                .Where(m => m.IsRecurrent && m.IsScheduled)
                .FirstOrDefaultAsync(s => s.Id == uid);
            if (meeting is null)
                throw new NotFoundException("Scheduled Meeting", uid.ToString());

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }
        public async Task<ScheduledMeetingDTO> PostAsync(ScheduledMeetingCreateDTO scheduledMeeting)
        {
            var newMeeting = _mapper.Map<Meeting>(scheduledMeeting);
            _context.Meetings.Add(newMeeting);
            /*var agendaPoints = scheduledMeeting.AgendaPoints;
            foreach(var a in agendaPoints)
            {
                _context.AgendaPoints.Add(a);
            }*/
            await _context.SaveChangesAsync();

            return await GetAsync(newMeeting.Id);
        }
        public async Task<ScheduledMeetingDTO> UpdateAsync(ScheduledMeetingDTO scheduledMeeting)
        {
            var meeting = _context.Meetings.FirstOrDefault(m => m.Id == scheduledMeeting.Id);

            if (meeting is null) 
                throw new NotFoundException("Scheduled Meeting", scheduledMeeting.Id.ToString());

            meeting.Settings = scheduledMeeting.Settings;
            meeting.StartTime = scheduledMeeting.ScheduledTime;
            meeting.AnonymousCount = scheduledMeeting.AnonymousCount;
            await _context.SaveChangesAsync();

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }
        public async Task DeleteAsync(Guid id)
        {
            var meeting = _context.Meetings.FirstOrDefault(c => c.Id == id);

            if (meeting is null)
                throw new NotFoundException("Scheduled Meeting", id.ToString());

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();

            return;
        }
    }
}
