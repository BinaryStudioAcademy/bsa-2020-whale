using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using Whale.Shared.Models.Meeting;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly HttpService _httpService;

        public MeetingController(HttpService httpService)
        {
            _httpService = httpService;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            meetingDto.CreatorEmail = ownerEmail;
            return Ok(await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("api/meeting", meetingDto));
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
        [HttpPut("updateMedia")]
        public async Task<ActionResult> UpdateMeetingMediaOnStart(MediaOnStartDTO mediaOnStartDTO)
        {
            mediaOnStartDTO.RequestingUserEmail =
                (HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);

            await _httpService.PutAsync("api/meeting/updateMedia", mediaOnStartDTO);
            return Ok();
        }
    }
}