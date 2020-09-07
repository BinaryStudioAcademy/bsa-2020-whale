using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Models.ScheduledMeeting;
using Whale.API.Services;
using Whale.Shared.Exceptions;
using Whale.Shared.Models;
using Whale.Shared.Models.ElasticModels.Statistics;
using Whale.Shared.Models.Meeting;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
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
            meetingDto.CreatorEmail = (HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);
            return Ok(await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("meeting", meetingDto));
        }

        [Authorize]
        [HttpPut("addParticipants")]
        public async Task<ActionResult<string>> AddParticipants(MeetingUpdateParticipantsDTO dto)
        {
            return Ok(await _httpService.PutStringAsync("meeting/addParticipants", dto));
        }

        [Authorize]
        [HttpPost("scheduled")]
        public async Task<ActionResult<string>> CreateMeetingScheduled(MeetingCreateDTO meetingDto)
        {
            meetingDto.CreatorEmail = (HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);
            return Ok(await _httpService.PostStringAsync("meeting/scheduled", meetingDto));
        }

        [Route("external/schedule")]
        [HttpPost]
        [Produces("application/json")]
        public async Task<ActionResult<string>> ExternalScheduleMeeting(ScheduledMeetingExternal data)
        {
            try
            {
                return Ok(await _externalScheduledMeetingService.StartScheduledMeetingAsync(data));
            }
            catch(NotFoundException e)
            {
                return Unauthorized($"{e.Message} Please sign up using the link:'{ExternalScheduledMeetingService.BaseUrl}'");
            }
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectMeeting(Guid id, string pwd)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(await _httpService.GetAsync<MeetingDTO>($"meeting?id={id}&pwd={pwd}&email={ownerEmail}"));
        }

        [HttpGet("shortInvite/{inviteLink}")]
        public async Task<ActionResult<string>> GetFullMeetingLink(string inviteLink)
        {
            return Ok(await _httpService.GetStringAsync($"meeting/shortInvite/{inviteLink}"));
        }

        [HttpGet("end")]
        public async Task<OkResult> SaveMeetingEndTime(Guid meetingId)
        {
            await _httpService.GetAsync<object>($"meeting/end?meetingId={meetingId}");
            return Ok();
        }

        [HttpGet("shortenLink/{longURL}")]
        public async Task<ActionResult<string>> GetShortURL(string longURL)
        {
            string shortLink = await _httpService.GetStringAsync($"meeting/shortenLink/{longURL}");
            return Ok(shortLink);
        }

        [Authorize]
        [HttpPut("updateSettings")]
        public async Task<ActionResult> UpdateMeetingSettings(UpdateSettingsDTO updateSettingsDTO)
        {
            updateSettingsDTO.ApplicantEmail =
                HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            await _httpService.PutAsync("meeting/updateSettings", updateSettingsDTO);
            return Ok();
        }

        [Authorize]
        [HttpPut("statistics")]
        public async Task<ActionResult> UpdateMeetingStatistics(UpdateStatistics statistics)
        {
            statistics.Email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            await _httpService.PutAsync("meeting/statistics", statistics);
            return Ok();
        }

        [HttpGet("agenda/{meetingId}")]
        public async Task<ActionResult<List<AgendaPointDTO>>> GetAgenda(string meetingId)
        {
            var agendaPoints = await _httpService.GetAsync<List<AgendaPointDTO>>($"meeting/agenda/{meetingId}");
            return Ok(agendaPoints);
        }

        [HttpPut("agenda")]
        public async Task<ActionResult> UpdateTopic(AgendaPointDTO point)
        {
            await _httpService.PutAsync<AgendaPointDTO, AgendaPointDTO>("meeting/agenda",point);
            return Ok();
        }
    }
}