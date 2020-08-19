using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using Whale.Shared.Models.Poll;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PollsController : ControllerBase
    {
        private readonly HttpService _httpService;

        public PollsController(HttpService httpService)
        {
            _httpService = httpService;
        }

        [HttpPost]
        public async Task<ActionResult<PollDTO>> PostPoll([FromBody] PollCreateDTO pollCreateDto)
        {
            var response = await _httpService.PostAsync<PollCreateDTO, PollDTO>("api/polls", pollCreateDto);
            return CreatedAtAction("PostPoll", response);
        }

        [HttpPost("answers")]
        public async Task<ActionResult> PostPollAnswer([FromBody] VoteDTO pollAnswerDto)
        {
            await _httpService.PostAsync("api/polls/answers", pollAnswerDto);
            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<PollsAndResultsDTO>> GetPollsAndResults(string meetingId, string userEmail)
        {
            return Ok(await _httpService.GetAsync<PollsAndResultsDTO>($"api/polls?meetingId={meetingId}&userEmail={userEmail}"));
        }

        [HttpDelete]
        public async Task<ActionResult> DeletePoll(string meetingId, string pollId)
        {
            await _httpService.DeleteAsync($"api/polls?meetingId={meetingId}&pollId={pollId}");
            return NoContent();
        }

        [HttpGet("saveResults")]
        public async Task<IActionResult> SavePollResults(Guid meetingId)
        {
            await _httpService.GetAsync<object>($"api/polls/saveResults?meetingId={meetingId}");
            return Ok();
        }
    }
}