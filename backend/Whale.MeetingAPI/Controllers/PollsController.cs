using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Whale.MeetingAPI.Services;
using Whale.Shared.Models.Poll;

namespace Whale.MeetingAPI.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class PollsController : ControllerBase
	{
		private readonly PollService _pollService;

		public PollsController(PollService pollService)
		{
			_pollService = pollService;
		}

		[HttpPost]
		public async Task<ActionResult<PollDTO>> PostPollAsync([FromBody] PollCreateDTO pollCreateDto)
		{
			var pollDto = await _pollService.CreatePollAsync(pollCreateDto);
			return CreatedAtAction("PostPoll", pollDto);
		}

		[HttpPost("answers")]
		public async Task<IActionResult> PostPollAnswerAsync([FromBody] VoteDTO pollAnswerDto)
		{
			await _pollService.SavePollAnswerAsync(pollAnswerDto);
			return Ok();
		}

		[HttpGet("saveResults")]
		public async Task<IActionResult> SavePollResultsAsync(Guid meetingId)
		{
			await _pollService.SavePollResultsToDatabaseAndDeleteFromRedisAsync(meetingId);
			return Ok();
		}

		[HttpGet]
		public async Task<ActionResult<PollsAndResultsDTO>> GetPollsAndResultsAsync(Guid meetingId, Guid userId)
		{
			try
			{
				return Ok(await _pollService.GetPollsAndResultsAsync(meetingId, userId));
			}
			catch (Exception e)
			{
				return BadRequest(e);
			}
		}

		[HttpDelete]
		public async Task<IActionResult> DeletePollAsync(string meetingId, string pollId)
		{
			await _pollService.DeletePollAsync(meetingId, pollId);
			return NoContent();
		}
	}
}
