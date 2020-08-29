using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly MeetingService _meetingService;

        public MeetingController(MeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            return Ok(await _meetingService.CreateMeeting(meetingDto));
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

        [HttpPut("updateMedia")]
        public async Task<ActionResult> UpdateMeetingMediaOnStart(MediaOnStartDTO mediaOnStartDTO)
        {
            await _meetingService.UpdateMeetingMediaOnStart(mediaOnStartDTO);
            return Ok();
        }
    }
}
