using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Whale.Shared.Jobs;
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

        public MeetingController(MeetingService meetingService, MeetingScheduleService meetingScheduleService)
        {
            _meetingService = meetingService;
            _meetingScheduleService = meetingScheduleService;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            return Ok(await _meetingService.CreateMeeting(meetingDto));
        }

        [AllowAnonymous]
        [HttpPost("scheduled")]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeetingScheduled(MeetingCreateDTO meetingDto)
        {
            var meeting = await _meetingService.RegisterScheduledMeeting(meetingDto);

            var jobInfo = new JobInfo(typeof(ScheduledMeetingJob), meetingDto.StartTime);
            var obj = JsonConvert.SerializeObject(meeting);
            await _meetingScheduleService.Start(jobInfo, obj);

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectToMeeting(Guid id, string pwd, string email)
        {
            return Ok(await _meetingService.ConnectToMeeting(new MeetingLinkDTO { Id = id, Password = pwd}, email));
        }

        [HttpGet("shortInvite/{inviteLink}")]
        public async Task<ActionResult<string>> GetFullMeetingLink(string inviteLink)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

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
    }
}
