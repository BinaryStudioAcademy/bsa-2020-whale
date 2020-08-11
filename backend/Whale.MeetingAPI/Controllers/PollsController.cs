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

		[HttpPost]
		public async Task<IActionResult> PostPoll([FromBody] PollCreateDTO pollCreateDto)
		{
			var pollDto = await _pollService.CreatePoll(pollCreateDto);
			return CreatedAtAction("PostPoll", pollDto);
		}

		[HttpPost("answers")]
		public async Task<IActionResult> PostPollAnswer([FromBody] PollAnswerDTO pollAnswerDto)
		{
			var results = await _pollService.SavePollAnswer(pollAnswerDto);
			return Ok(results);
		}
	}
}
