using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Interfaces;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.Services;
using Whale.Shared.DTO.Meeting.MeetingMessage;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost]
        public async Task<ActionResult<MeetingLinkDTO>> CreateMeeting(MeetingCreateDTO meetingDto)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            var emails = new List<string>
            {
                ownerEmail
            };
            return Ok(await _meetingService.CreateMeeting(meetingDto, emails));
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectToMeeting(Guid id, string pwd)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(await _meetingService.ConnectToMeeting(new MeetingLinkDTO { Id = id, Password = pwd}, ownerEmail));
        }
    }

}
