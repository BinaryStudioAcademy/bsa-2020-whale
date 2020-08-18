using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services;

namespace Whale.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class MeetingHistoryController : ControllerBase
	{
		private readonly MeetingHistoryService _meetingHistoryService;

		public MeetingHistoryController(MeetingHistoryService meetingHistoryService)
		{
			_meetingHistoryService = meetingHistoryService;
		}

		[HttpGet]
		public async Task<IActionResult> GetMeetings(Guid userId)
		{
			var meetings = await _meetingHistoryService.GetMeetingsWithParticipantsAndPollResults(userId);
			return Ok(meetings);
		}
	}
}
