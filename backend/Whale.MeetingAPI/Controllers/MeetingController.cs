using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Interfaces;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.Services;

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
            var link = await _meetingService.CreateMeeting(meetingDto);
            return Created($"api/Projects/{link.Id}", link);
        }

        [HttpGet]
        public async Task<ActionResult<MeetingDTO>> ConnectToMeeting(MeetingLinkDTO link)
        {
            return Ok(await _meetingService.ConnectToMeeting(link));
        }
    }

}