using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Models.ScheduledMeeting;
using Whale.API.Services;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Meeting;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly HttpService _httpService;
        private readonly ExternalScheduledMeetingService _externalScheduledMeetingService;

        public MeetingController(HttpService httpService, ExternalScheduledMeetingService externalScheduledMeetingService)
        {
            _httpService = httpService;
            _externalScheduledMeetingService = externalScheduledMeetingService;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            meetingDto.CreatorEmail = ownerEmail;
            return Ok(await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("api/meeting", meetingDto));
        }

        [HttpPost("scheduled")]
        public async Task<ActionResult<string>> CreateMeetingScheduled(MeetingCreateDTO meetingDto)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            meetingDto.CreatorEmail = ownerEmail;
            return Ok(await _httpService.PostStringAsync("api/meeting/scheduled", meetingDto));
        }

        [Route("external/schedule")]
        [HttpPost]
        [Produces("application/json")]
        public async Task<ActionResult<string>> ExternalScheduleMeeting(ScheduledMeetingExternal data)
        {
            try
            {
                return Ok(await _externalScheduledMeetingService.StartScheduledMeeting(data));
            }
            catch(NotFoundException e)
            {
                return BadRequest($"{e.Message}. Please sign up using the link:'{ExternalScheduledMeetingService.BaseUrl}'");
            }
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectMeeting(Guid id, string pwd)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(await _httpService.GetAsync<MeetingDTO>($"api/meeting?id={id}&pwd={pwd}&email={ownerEmail}"));
        }

        [HttpGet("shortInvite/{inviteLink}")]
        public async Task<ActionResult<string>> GetFullMeetingLink(string inviteLink)
        {
            return Ok(await _httpService.GetStringAsync($"api/meeting/shortInvite/{inviteLink}"));
        }

        [HttpGet("end")]
        public async Task<OkResult> SaveMeetingEndTime(Guid meetingId)
        {
            await _httpService.GetAsync<object>($"api/meeting/end?meetingId={meetingId}");
            return Ok();
        }

        [HttpGet("shortenLink/{longURL}")]
        public async Task<ActionResult<string>> GetShortURL(string longURL)
        {
            string shortLink = await _httpService.GetStringAsync($"api/meeting/shortenLink/{longURL}");
            return Ok(shortLink);
        }

        [Authorize]
        [HttpPut("updateSettings")]
        public async Task<ActionResult> UpdateMeetingSettings(UpdateSettingsDTO updateSettingsDTO)
        {
            updateSettingsDTO.ApplicantEmail = 
                HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            await _httpService.PutAsync("api/meeting/updateSettings", updateSettingsDTO);
            return Ok();
        }
    }
}