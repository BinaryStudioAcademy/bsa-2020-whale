using AutoMapper;
using Microsoft.AspNetCore.SignalR.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models.Question;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Question;
using Whale.Shared.Services;
using Whale.Shared.Services.Abstract;

namespace Whale.MeetingAPI.Services
{
	public class QuestionService : BaseService
	{
		private readonly SignalrService _signalrService;
		private readonly RedisService _redisService;

		public QuestionService(
			WhaleDbContext context, 
			IMapper mapper, 
			SignalrService signalrService, 
			RedisService redisService)
			: base(context, mapper)
		{
			_signalrService = signalrService;
			_redisService = redisService;
		}

		public async Task<IEnumerable<QuestionDTO>> GetQuestionsByMeetingFromRedis(Guid meetingId)
		{
			await _redisService.ConnectAsync();
			var questions = await _redisService.GetSetMembers<Question>(meetingId + nameof(Question));
			questions = questions.OrderBy(q => q.AskedAt);
			var questionDtos = _mapper.Map<IEnumerable<QuestionDTO>>(questions);
			return questionDtos;
		}

		public async Task CreateQuestion(QuestionCreateDTO questionCreate)
		{
			var question = _mapper.Map<Question>(questionCreate);
			question.Id = Guid.NewGuid();
			question.AskedAt = DateTimeOffset.Now;

			await _redisService.ConnectAsync();
			await _redisService.AddToSet<Question>(questionCreate.MeetingId + nameof(Question), question);

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			var questionDto = _mapper.Map<QuestionDTO>(question);
			await connection.InvokeAsync("QuestionCreate", questionDto);
		}

		public async Task UpdateQuestionStatus(QuestionStatusUpdateDTO questionStatusUpdate)
		{
			await _redisService.ConnectAsync();
			var setKey = questionStatusUpdate.MeetingId + nameof(Question);
			var questions = await _redisService.GetSetMembers<Question>(setKey);
			var question = questions.FirstOrDefault(q => q.Id == questionStatusUpdate.QuestionId);

			if(question == null)
			{
				throw new NotFoundException(nameof(Question), questionStatusUpdate.QuestionId.ToString());
			}

			await _redisService.DeleteSetMember<Question>(setKey, question);
			question.QuestionStatus = questionStatusUpdate.QuestionStatus;
			await _redisService.AddToSet<Question>(setKey, question);

			// signal
			var connecton = await _signalrService.ConnectHubAsync("meeting");
			await connecton.InvokeAsync("QuestionStatusUpdate", questionStatusUpdate);
		}

		public async Task DeleteQuestion(QuestionDeleteDTO questionDelete)
		{
			await _redisService.ConnectAsync();
			var setKey = questionDelete.MeetingId + nameof(Question);
			var questions = await _redisService.GetSetMembers<Question>(setKey);
			var question = questions.FirstOrDefault(q => q.Id == questionDelete.QuestionId);

			if (question == null)
			{
				throw new NotFoundException(nameof(Question), questionDelete.QuestionId.ToString());
			}

			await _redisService.DeleteSetMember<Question>(setKey, question);

			// signal
			var connecton = await _signalrService.ConnectHubAsync("meeting");
			await connecton.InvokeAsync("QuestionDelete", questionDelete);
		}

		public async Task DeleteQuestionsFromRedisAndSaveToDatabase(Guid meetingId)
		{
			await _redisService.ConnectAsync();
			var questions = await _redisService.GetSetMembers<Question>(meetingId + nameof(Question));

			await _context.Questions.AddRangeAsync(questions);
			await _context.SaveChangesAsync();

			await _redisService.DeleteKey(meetingId + nameof(Question));
		}
	}
}
