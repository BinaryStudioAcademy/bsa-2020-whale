using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Models.ScheduledMeeting;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Participant;
using Whale.Shared.Models.Poll;
using Whale.Shared.Models.User;
using Whale.Shared.Services;
using Whale.Shared.Services.Abstract;

namespace Whale.API.Services
{
    public class ScheduledMeetingsService: BaseService
    {
        private readonly UserService _userService;
        private readonly NotificationsService _notificationsService;

        public ScheduledMeetingsService(
            WhaleDbContext context,
            IMapper mapper,
            UserService userService,
            NotificationsService notificationsService)
            : base(context, mapper) {
            _userService = userService;
            _notificationsService = notificationsService;
        }

        public async Task<ScheduledMeetingDTO> GetAsync(Guid uid)
        {
            var meeting = await _context.Meetings
                .Where(m => m.IsRecurrent && m.IsScheduled)
                .FirstOrDefaultAsync(s => s.Id == uid);
            if (meeting is null)
                throw new NotFoundException("Scheduled Meeting", uid.ToString());

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }

        public async Task<IEnumerable<UserDTO>> GetParticipantsAsync(Guid uid)
        {
            var scheduled = await _context.ScheduledMeetings.FirstOrDefaultAsync(s => s.Id == uid);
            if (scheduled == null)
                throw new NotFoundException("Scheduled Meeting", uid.ToString());

            var participantEmails = JsonConvert.DeserializeObject<List<string>>(scheduled.ParticipantsEmails);
            var userParticipants = (await _userService.GetAllUsersAsync()).Where(u => participantEmails.Contains(u.Email));

            return userParticipants;
        }

        public async Task<IEnumerable<ScheduledDTO>> GetUpcomingScheduledAsync(string email, int skip, int take)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null)
                throw new NotFoundException("User", email);

            var scheduledList = _context.ScheduledMeetings.Where(s => s.CreatorId == user.Id || s.ParticipantsEmails.Contains(user.Email)).ToList();
            var scheduledDTOList = new List<ScheduledDTO>();
            foreach (var scheduled in scheduledList)
            {
                var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == scheduled.MeetingId);
                if (meeting.StartTime < DateTime.Now.AddHours(-1) || meeting.EndTime > meeting.StartTime)
                {
                    continue;
                }
                var participantEmails = JsonConvert.DeserializeObject<List<string>>(scheduled.ParticipantsEmails);
                var userParticipants = (await _userService.GetAllUsersAsync()).Where(u => participantEmails.Contains(u.Email));
                var creator = scheduled.CreatorId == user.Id ? user : await _userService.GetUserAsync(scheduled.CreatorId);
                var settings = JsonConvert.DeserializeObject<MeetingSettingsDTO>(meeting.Settings);
                var meetingDTO =  new MeetingDTO
                {
                    Id = meeting.Id,
                    Settings = meeting.Settings,
                    StartTime = meeting.StartTime,
                    EndTime = meeting.EndTime,
                    AnonymousCount = meeting.AnonymousCount,
                    IsScheduled = meeting.IsScheduled,
                    IsRecurrent = meeting.IsRecurrent,
                    IsVideoAllowed = settings.IsVideoAllowed,
                    IsAudioAllowed = settings.IsAudioAllowed,
                    IsWhiteboard = settings.IsWhiteboard,
                    IsPoll = settings.IsPoll,
                    IsAllowedToChooseRoom = settings.IsAllowedToChooseRoom,
                    RecognitionLanguage = settings.RecognitionLanguage,
                    Recurrence = settings.Recurrence,
                    Participants = _mapper.Map<IEnumerable<ParticipantDTO>>(meeting.Participants),
                    PollResults = _mapper.Map<IEnumerable<PollResultDTO>>(meeting.PollResults)
                };
                scheduledDTOList.Add(new ScheduledDTO
                {
                    Id = scheduled.Id,
                    Meeting = meetingDTO,
                    Creator = creator,
                    Participants = userParticipants.ToList(),
                    Link = scheduled.ShortURL,
                    Canceled = scheduled.Canceled
                });
            }

            return scheduledDTOList
                .OrderBy(s => s.Meeting.StartTime)
                .Skip(skip)
                .Take(take);
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

            if (meeting is null)
                throw new NotFoundException("Scheduled Meeting", scheduledMeeting.Id.ToString());

            meeting.Settings = scheduledMeeting.Settings;
            meeting.StartTime = scheduledMeeting.ScheduledTime;
            meeting.AnonymousCount = scheduledMeeting.AnonymousCount;
            await _context.SaveChangesAsync();

            return _mapper.Map<ScheduledMeetingDTO>(meeting);
        }

        public async Task CancelScheduledMeetingAsync(Guid scheduledMeetingId, string applicantEmail)
        {
            var scheduled = _context.ScheduledMeetings.FirstOrDefault(s => s.Id == scheduledMeetingId);
            if (scheduled == null)
                throw new NotFoundException("Scheduled Meeting", scheduledMeetingId.ToString());

            var meeting = _context.Meetings.FirstOrDefault(m => m.Id == scheduled.MeetingId);
            if (meeting == null)
                throw new NotFoundException("Meeting", scheduledMeetingId.ToString());

            var applicant = await _userService.GetUserByEmailAsync(applicantEmail);
            if (applicant == null)
                throw new NotFoundException("User");

            if (scheduled.CreatorId != applicant.Id)
                throw new NotAllowedException(applicantEmail);

            scheduled.Canceled = true;

            await _context.SaveChangesAsync();

            foreach (var email in JsonConvert.DeserializeObject<List<string>>(scheduled.ParticipantsEmails))
            {
                if (applicantEmail != email)
                {
                    await _notificationsService.AddTextNotification(email,
                        $"{applicantEmail} has canceled the meeting on {meeting.StartTime.AddHours(3).ToString("f", new CultureInfo("us-EN"))}");
                }
            }
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
