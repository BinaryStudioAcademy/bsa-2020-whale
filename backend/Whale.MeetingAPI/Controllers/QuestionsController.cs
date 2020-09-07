using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.MeetingAPI.Services;
using Whale.Shared.Models.Question;

namespace Whale.MeetingAPI.Controllers
{
    [ApiController]
	[Route("[controller]")]
	public class QuestionsController : ControllerBase
	{
		private readonly QuestionService _questionService;

		public QuestionsController(QuestionService questionService)
		{
			_questionService = questionService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionsByMeetingAsync(Guid meetingId)
		{
			return Ok(await _questionService.GetQuestionsByMeetingFromRedisAsync(meetingId));
		}

		[HttpPost]
		public async Task<OkResult> CreateQuestionAsync([FromBody] QuestionCreateDTO questionCreate)
		{
			await _questionService.CreateQuestionAsync(questionCreate);
			return Ok();
		}

		[HttpPut("status")]
		public async Task<OkResult> UpdateQuestionStatusAsync([FromBody] QuestionStatusUpdateDTO questionStatusUpdate)
		{
			await _questionService.UpdateQuestionStatusAsync(questionStatusUpdate);
			return Ok();
		}

		[HttpDelete("{questionId}")]
		public async Task<NoContentResult> DeleteQuestionAsync(Guid questionId, Guid meetingId)
		{
			await _questionService.DeleteQuestionAsync(new QuestionDeleteDTO
			{
				QuestionId = questionId,
				MeetingId = meetingId
			});

			return NoContent();
		}
	}
}
