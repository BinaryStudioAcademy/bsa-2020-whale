using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Whale.MeetingAPI.Services;
using Whale.Shared.Models.Poll;

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
		public async Task<ActionResult<PollDTO>> PostPoll([FromBody] PollCreateDTO pollCreateDto)
		{
			var pollDto = await _pollService.CreatePoll(pollCreateDto);
			return CreatedAtAction("PostPoll", pollDto);
		}

		[HttpPost("answers")]
		public async Task<IActionResult> PostPollAnswer([FromBody] VoteDTO pollAnswerDto)
		{
			try
			{
				await _pollService.SavePollAnswer(pollAnswerDto);
				return Ok();
			}
			catch(Exception e)
			{
				return BadRequest(e);
			}
		}

		[HttpGet("saveResults")]
		public async Task<IActionResult> SavePollResults(Guid meetingId)
		{
			await _pollService.SavePollResultsToDatabase(meetingId);
			return Ok();
		}

		[HttpGet]
		public async Task<ActionResult<PollsAndResultsDTO>> GetPollsAndResults(string meetingId, string userEmail)
		{
			try
			{
				var pollsAndResultsDto = await _pollService.GetPolls(meetingId, userEmail);
				return Ok(pollsAndResultsDto);
			}
			catch (Exception e)
			{
				return BadRequest(e);
			}
		}

		[HttpDelete]
		public async Task<IActionResult> DeletePoll(string meetingId, string pollId)
		{
			await _pollService.DeletePoll(meetingId, pollId);
			return NoContent();
		}
	}
}
