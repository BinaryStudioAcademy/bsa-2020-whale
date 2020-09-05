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

		public async Task<IEnumerable<QuestionDTO>> GetQuestionsByMeetingFromRedisAsync(Guid meetingId)
		{
			await _redisService.ConnectAsync();

			var questions = await _redisService.GetSetMembersAsync<Question>(meetingId + nameof(Question));
			questions = questions.OrderBy(q => q.AskedAt);

			return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
		}

		public async Task CreateQuestionAsync(QuestionCreateDTO questionCreate)
		{
			var question = _mapper.Map<Question>(questionCreate);
			question.Id = Guid.NewGuid();
			question.AskedAt = DateTimeOffset.Now;

			await _redisService.ConnectAsync();
			await _redisService.AddToSetAsync<Question>(questionCreate.MeetingId + nameof(Question), question);

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			var questionDto = _mapper.Map<QuestionDTO>(question);
			await connection.InvokeAsync("QuestionCreate", questionDto);
		}

		public async Task UpdateQuestionStatusAsync(QuestionStatusUpdateDTO questionStatusUpdate)
		{
			await _redisService.ConnectAsync();
			var setKey = questionStatusUpdate.MeetingId + nameof(Question);
			var questions = await _redisService.GetSetMembersAsync<Question>(setKey);
			var question = questions.FirstOrDefault(q => q.Id == questionStatusUpdate.QuestionId);

			if(question == null)
			{
				throw new NotFoundException(nameof(Question), questionStatusUpdate.QuestionId.ToString());
			}

			await _redisService.DeleteSetMemberAsync<Question>(setKey, question);
			question.QuestionStatus = questionStatusUpdate.QuestionStatus;
			await _redisService.AddToSetAsync<Question>(setKey, question);

			// signal
			var connecton = await _signalrService.ConnectHubAsync("meeting");
			await connecton.InvokeAsync("QuestionStatusUpdate", questionStatusUpdate);
		}

		public async Task DeleteQuestionAsync(QuestionDeleteDTO questionDelete)
		{
			await _redisService.ConnectAsync();
			var setKey = questionDelete.MeetingId + nameof(Question);
			var questions = await _redisService.GetSetMembersAsync<Question>(setKey);
			var question = questions.FirstOrDefault(q => q.Id == questionDelete.QuestionId);

			if (question == null)
			{
				throw new NotFoundException(nameof(Question), questionDelete.QuestionId.ToString());
			}

			await _redisService.DeleteSetMemberAsync<Question>(setKey, question);

			// signal
			var connecton = await _signalrService.ConnectHubAsync("meeting");
			await connecton.InvokeAsync("QuestionDelete", questionDelete);
		}

		public async Task DeleteQuestionsFromRedisAndSaveToDatabaseAsync(Guid meetingId)
		{
			await _redisService.ConnectAsync();
			var questions = await _redisService.GetSetMembersAsync<Question>(meetingId + nameof(Question));

			await _context.Questions.AddRangeAsync(questions);
			await _context.SaveChangesAsync();

			await _redisService.DeleteKeyAsync(meetingId + nameof(Question));
		}
	}
}
