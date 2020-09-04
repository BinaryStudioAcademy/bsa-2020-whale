using System;
using System.Globalization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Whale.Shared.Jobs;
using Whale.Shared.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly MeetingService _meetingService;
        private readonly MeetingScheduleService _meetingScheduleService;
        private readonly NotificationsService _notifications;

        public MeetingController(MeetingService meetingService, MeetingScheduleService meetingScheduleService, NotificationsService notifications)
        {
            _meetingService = meetingService;
            _meetingScheduleService = meetingScheduleService;
            _notifications = notifications;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            return Ok(await _meetingService.CreateMeeting(meetingDto));
        }

        [HttpPost("scheduled")]
        public async Task<ActionResult<string>> CreateMeetingScheduled(MeetingCreateDTO meetingDto)
        {
            var meetingAndLink = await _meetingService.RegisterScheduledMeeting(meetingDto);
                Console.WriteLine(meetingDto.Recurrency);
            if (meetingDto.Recurrency != JobRecurrencyEnum.Never)
            {
                try
                {
                    var jobInfo = new RecurrentJobInfo(typeof(RecurrentScheduledMeetingJob), meetingDto.StartTime, meetingDto.Recurrency);
                    var obj = JsonConvert.SerializeObject(meetingAndLink.Meeting);
                    await _meetingScheduleService.StartRecurrent(jobInfo, obj);
                }
                catch (Exception e )
                {
                    Console.WriteLine(e.Message);
                }
            }
            else
            {
                var jobInfo = new JobInfo(typeof(ScheduledMeetingJob), meetingDto.StartTime);
                var obj = JsonConvert.SerializeObject(meetingAndLink.Meeting);
                await _meetingScheduleService.Start(jobInfo, obj);

                foreach (var email in meetingDto.ParticipantsEmails)
                {
                    if (meetingDto.CreatorEmail != email)
                        await _notifications.AddTextNotification(email, $"{meetingDto.CreatorEmail} invites you to a meeting on {meetingDto.StartTime.AddHours(3).ToString("f", new CultureInfo("us-EN"))}");
                }
            }
                return Ok(/*meetingAndLink.Link*/);
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectToMeeting(Guid id, string pwd, string email)
        {
            return Ok(await _meetingService.ConnectToMeeting(new MeetingLinkDTO { Id = id, Password = pwd}, email));
        }

        [HttpGet("shortInvite/{inviteLink}")]
        public async Task<ActionResult<string>> GetFullMeetingLink(string inviteLink)
        {
            var meetingLink = await _meetingService.GetFullInviteLink(inviteLink);

            return Ok(meetingLink);
        }

        [HttpGet("shortenLink")]
        public async Task<ActionResult<string>> GetShortURL(string id, string pwd)
        {
            string shortLink = await _meetingService.GetShortInviteLink(id, pwd);
            return Ok(shortLink);
        }

        [HttpGet("end")]
        public async Task<OkResult> SaveMeetingEndTime(Guid meetingId)
        {
            await _meetingService.EndMeeting(meetingId);
            return Ok();
        }

        [HttpPut("updateSettings")]
        public async Task<ActionResult> UpdateMeetingSettings(UpdateSettingsDTO updateSettingsDTO)
        {
            await _meetingService.UpdateMeetingSettings(updateSettingsDTO);
            return Ok();
        }
        [HttpGet("agenda/{meetingId}")]
        public async Task<ActionResult<List<AgendaPointDTO>>> GetAgenda(string meetingId)
        {
            List<AgendaPointDTO> agendaPoints = await _meetingService.GetAgendaPoints(meetingId);//_httpService.GetAsync<List<AgendaPointDTO>>($"api/meeting/agenda/{meetingId}");
            return Ok(agendaPoints);
        }
    }
}
