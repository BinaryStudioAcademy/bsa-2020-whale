using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.BLL.Services;
using Whale.Shared.DTO.Poll;

namespace Whale.MeetingAPI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PollsController : ControllerBase
	{
		private readonly PollService _pollService;

		public PollsController(PollService pollService)
		{
			_pollService = pollService;
		}

		[HttpGet]
		public async Task<IActionResult> GetPollByMeetingId(Guid meetingId)
		{
			var pollDto = await _pollService.GetPollByMeetingId(meetingId);
			return Ok(pollDto);
		}

		[HttpPost]
		public async Task<IActionResult> PostPoll(PollDTO pollDto)
		{
			await _pollService.CreatePoll(pollDto);
			return CreatedAtAction("PostPoll", pollDto);
		}
	}
}
