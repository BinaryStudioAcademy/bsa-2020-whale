using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
            return Ok(await _httpService.GetAsync<string>($"api/meeting/shortInvite/{inviteLink}"));
        }

        [HttpGet("shortenLink/{longURL}")]
        public async Task<ActionResult<string>> GetShortURL(string longURL)
        {
            return Ok(await _httpService.GetAsync<string>($"api/meeting/shortenLink/{longURL}"));
        }
    }
}