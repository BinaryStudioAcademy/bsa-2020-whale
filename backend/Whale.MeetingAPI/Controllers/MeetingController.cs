using System;
using System.Globalization;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Whale.Shared.Jobs;
using Whale.Shared.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;
using Whale.Shared.Models.ElasticModels.Statistics;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly MeetingService _meetingService;
        private readonly MeetingScheduleService _meetingScheduleService;
        private readonly NotificationsService _notifications;

        public MeetingController(
            MeetingService meetingService,
            MeetingScheduleService meetingScheduleService,
            NotificationsService notifications)
        {
            _meetingService = meetingService;
            _meetingScheduleService = meetingScheduleService;
            _notifications = notifications;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeetingAsync(MeetingCreateDTO meetingDto)
        {
            return Ok(await _meetingService.CreateMeetingAsync(meetingDto));
        }

        [HttpPost("scheduled")]
        public async Task<ActionResult<string>> CreateMeetingScheduledAsync(MeetingCreateDTO meetingDto)
        {
            var meetingAndLink = await _meetingService.RegisterScheduledMeetingAsync(meetingDto);
            var jobInfo = new JobInfo(typeof(ScheduledMeetingJob), meetingDto.StartTime);
            var obj = JsonConvert.SerializeObject(meetingAndLink.Meeting);
            await _meetingScheduleService.StartAsync(jobInfo, obj);

            foreach (var email in meetingDto.ParticipantsEmails)
            {
                if(meetingDto.CreatorEmail != email)
                await _notifications.AddTextNotification(email, $"{meetingDto.CreatorEmail} invites you to a meeting on {meetingDto.StartTime.AddHours(3).ToString("f", new CultureInfo("us-EN"))}");
            }

            return Ok(meetingAndLink.Link);
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectToMeetingAsync(Guid id, string pwd, string email)
        {
            return Ok(await _meetingService.ConnectToMeetingAsync(new MeetingLinkDTO { Id = id, Password = pwd}, email));
        }

        [HttpGet("shortInvite/{inviteLink}")]
        public async Task<ActionResult<string>> GetFullMeetingLinkAsync(string inviteLink)
        {
            return Ok(await _meetingService.GetFullInviteLinkAsync(inviteLink));
        }

        [HttpGet("shortenLink")]
        public async Task<ActionResult<string>> GetShortURLAsync(string id, string pwd)
        {
            return Ok(await _meetingService.GetShortInviteLinkAsync(id, pwd));
        }

        [HttpGet("end")]
        public async Task<OkResult> SaveMeetingEndTimeAsync(Guid meetingId)
        {
            await _meetingService.EndMeetingAsync(meetingId);
            return Ok();
        }

        [HttpPut("updateSettings")]
        public async Task<ActionResult> UpdateMeetingSettingsAsync(UpdateSettingsDTO updateSettingsDTO)
        {
            await _meetingService.UpdateMeetingSettingsAsync(updateSettingsDTO);
            return Ok();
        }
        [HttpGet("agenda/{meetingId}")]
        public ActionResult<List<AgendaPointDTO>> GetAgenda(string meetingId)
        {
            return Ok(_meetingService.GetAgendaPoints(meetingId));
        }

        [HttpPut("agenda")]
        public async Task<ActionResult> UpdateTopicAsync(AgendaPointDTO topic)
        {
            await _meetingService.UpdateTopic(topic);
            return Ok();
        }

        [HttpPut("statistics")]
        public async Task<ActionResult> UpdateMeetingStatistics(UpdateStatistics statistics)
        {
            await _meetingService.UpdateMeetingStatistic(statistics);
            return Ok();
        }

        [HttpPost("reloadStatistics")]
        public async Task<ActionResult> ReloadStatisticsAsync()
        {
            await _meetingService.ReloadStatistics();
            return Ok();
        }
    }
}
