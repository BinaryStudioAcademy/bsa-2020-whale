using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.MeetingAPI.Services;
using Whale.Shared.Models.Question;

namespace Whale.MeetingAPI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class QuestionsController : ControllerBase
	{
		private readonly QuestionService _questionService;

		public QuestionsController(QuestionService questionService)
		{
			_questionService = questionService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionsByMeeting(Guid meetingId)
		{
			var questions = await _questionService.GetQuestionsByMeetingFromRedis(meetingId);
			return Ok(questions);
		}

		[HttpPost]
		public async Task<OkResult> CreateQuestion([FromBody] QuestionCreateDTO questionCreate)
		{
			await _questionService.CreateQuestion(questionCreate);
			return Ok();
		}

		[HttpPut("status")]
		public async Task<OkResult> UpdateQuestionStatus([FromBody] QuestionStatusUpdateDTO questionStatusUpdate)
		{
			await _questionService.UpdateQuestionStatus(questionStatusUpdate);
			return Ok();
		}

		[HttpDelete("{questionId}")]
		public async Task<NoContentResult> DeleteQuestion(Guid questionId, Guid meetingId)
		{
			await _questionService.DeleteQuestion(new QuestionDeleteDTO 
			{ 
				QuestionId = questionId, 
				MeetingId = meetingId 
			});

			return NoContent();
		}
	}
}
