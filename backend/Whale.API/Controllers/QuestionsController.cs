using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.API.Services;
using Whale.Shared.Models.Question;

namespace Whale.API.Controllers
{
    [ApiController]
	[Route("[controller]")]
	public class QuestionsController : ControllerBase
	{
		private readonly HttpService _httpService;

		public QuestionsController(HttpService httpService)
		{
			_httpService = httpService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionsByMeeting(Guid meetingId)
		{
			var questions = await _httpService.GetAsync<IEnumerable<QuestionDTO>>($"questions?meetingId={meetingId}");
			return Ok(questions);
		}

		[HttpPost]
		public async Task<OkResult> CreateQuestion([FromBody] QuestionCreateDTO questionCreate)
		{
			await _httpService.PostAsync<QuestionCreateDTO>("questions", questionCreate);
			return Ok();
		}

		[HttpPut("status")]
		public async Task<OkResult> UpdateQuestionStatus([FromBody] QuestionStatusUpdateDTO questionStatusUpdate)
		{
			await _httpService.PutAsync<QuestionStatusUpdateDTO>("questions/status", questionStatusUpdate);
			return Ok();
		}

		[HttpDelete("{questionId}")]
		public async Task<NoContentResult> DeleteQuestion(Guid questionId, Guid meetingId)
		{
			await _httpService.DeleteAsync($"questions/{questionId}?meetingId={meetingId}");
			return NoContent();
		}
	}
}
