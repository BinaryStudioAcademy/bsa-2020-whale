using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;
using Whale.BLL.Hubs;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.DTO.Poll;
using Whale.Shared.Helpers;
using Whale.Shared.Services;

namespace Whale.BLL.Services
{
	public class PollService : BaseService
	{
		private readonly IHubContext<MeetingHub> _meetingHub;
		private readonly RedisService _redisService;

		public PollService(WhaleDbContext context, IMapper mapper, IHubContext<MeetingHub> meetingHub, RedisService redisService) 
			: base(context, mapper) 
		{
			_meetingHub = meetingHub;
			this._redisService = redisService;
		}

		public async Task<PollDTO> CreatePoll(PollCreateDTO pollDto)
		{
			if(!_context.Meetings.Any(meeting => meeting.Id == pollDto.MeetingId))
			{
				throw new NotFoundException(nameof(Meeting));
			}

			Poll pollEntity = _mapper.Map<Poll>(pollDto);
			pollEntity.Id = Guid.NewGuid();

			_redisService.Connect();
			// create set of Poll Results with poll Id key
			_redisService.Set<Poll>(pollEntity.Id.ToString(), pollEntity);

			var pollDto2 = _mapper.Map<PollDTO>(pollEntity);
			return pollDto2;
		}

		public async Task<PollResultsDTO> SavePollAnswer(PollAnswerDTO pollAnswerDto)
		{
			pollAnswerDto.UserId = Guid.NewGuid().ToString();
			_redisService.Connect();
			_redisService.AddToSet<PollAnswerDTO>(pollAnswerDto.PollId.ToString() + nameof(PollAnswerDTO), pollAnswerDto);

			var pollAnswerDtos = _redisService.GetSetMembers<PollAnswerDTO>(pollAnswerDto.PollId.ToString() + nameof(PollAnswerDTO));

			var poll = _redisService.Get<Poll>(pollAnswerDto.PollId.ToString());
			var meetingId = poll.MeetingId;
			// signal

			return GetPollResults(poll, pollAnswerDtos);
		}

		private PollResultsDTO GetPollResults(Poll poll, ICollection<PollAnswerDTO> pollAnswerDtos)
		{
			var answers = pollAnswerDtos.Select(answer => answer.Answers);

			int[] results = new int[poll.Answers.Count];
			var pollResultsDto = new PollResultsDTO { PollDto = _mapper.Map<PollDTO>(poll) };

			for (int i = 0; i < poll.Answers.Count; i++) 
			{
				string answer = pollResultsDto.PollDto.Answers[i];
				int answerVotedCount = answers.Count(subAnswer => subAnswer.Contains(i));
				pollResultsDto.Results2.Add(answer, answerVotedCount);
			}

			return pollResultsDto;
		}
	}
}
