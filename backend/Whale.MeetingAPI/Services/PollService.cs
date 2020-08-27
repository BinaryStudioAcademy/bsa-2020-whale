using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using shortid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Poll;
using Whale.Shared.Services;
using Whale.Shared.Services.Abstract;

namespace Whale.MeetingAPI.Services
{
	public class PollService : BaseService
	{
		private readonly SignalrService _signalrService;
		private readonly RedisService _redisService;

		public PollService(WhaleDbContext context, IMapper mapper, SignalrService signalrService, RedisService redisService) 
			: base(context, mapper) 
		{
			_signalrService = signalrService;
			this._redisService = redisService;
		}

		public async Task<PollDTO> CreatePoll(PollCreateDTO pollCreateDto)
		{
			_redisService.Connect();
			var meetingData = await _redisService.GetAsync<MeetingMessagesAndPasswordDTO>(pollCreateDto.MeetingId.ToString());
			if (meetingData is null) throw new NotFoundException(nameof(Meeting));

			Poll pollEntity = _mapper.Map<Poll>(pollCreateDto);
			pollEntity.Id = Guid.NewGuid();
			pollEntity.CreatedAt = DateTimeOffset.Now;

			await _redisService.AddToSet<Poll>(pollEntity.MeetingId.ToString() + nameof(Poll), pollEntity);

			var pollDto = _mapper.Map<PollDTO>(pollEntity);
			return pollDto;
		}

		public async Task SavePollAnswer(VoteDTO voteDto)
		{
			_redisService.Connect();

			var voteEntity = _mapper.Map<Vote>(voteDto);

			string resultSetKey = voteDto.MeetingId + nameof(Poll);
			var polls = await _redisService.GetSetMembers<Poll>(resultSetKey);
			var poll = polls.FirstOrDefault(poll => poll.Id == voteDto.PollId);

			await _redisService.DeleteSetMember<Poll>(resultSetKey, poll);

			// include user's vote in OptionResults
			foreach (string choosedOption in voteDto.ChoosedOptions)
			{
				OptionResult optionResult = poll.OptionResults.FirstOrDefault(optResult => optResult.Option == choosedOption);
				optionResult.VotedUserIds = optionResult.VotedUserIds.Append(voteDto.User.Id);
			}

			if (!poll.IsAnonymous && !poll.VotedUsers.Any(voter => voter.Id == voteDto.User.Id))
			{
				var voter = _mapper.Map<Voter>(voteDto.User);
				poll.VotedUsers = poll.VotedUsers.Append(voter);
			}
			
			await _redisService.AddToSet<Poll>(resultSetKey, poll);

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			var pollResultDto = _mapper.Map<PollResultDTO>(poll);
			await connection.InvokeAsync("OnPollResults", voteDto.MeetingId.ToString(), pollResultDto);
		}

		public async Task<PollsAndResultsDTO> GetPollsAndResults(Guid meetingId, Guid userId)
		{
			_redisService.Connect();

			var polls = await _redisService.GetSetMembers<Poll>(meetingId + nameof(Poll));
			polls = polls.OrderByDescending(poll => poll.CreatedAt);

			var resultsToSend = polls
				.Where(poll => poll.OptionResults
				.Any(optRes => optRes.VotedUserIds
				.Any(id => id == userId)));

			var pollsToSend = polls.Except(resultsToSend);

			var pollsAndResultsDTO = new PollsAndResultsDTO
			{
				Polls = _mapper.Map<IEnumerable<PollDTO>>(pollsToSend),
				Results = _mapper.Map<IEnumerable<PollResultDTO>>(resultsToSend),
			};

			return pollsAndResultsDTO;
		}

		public async Task DeletePoll(string meetingId, string pollId)
		{
			_redisService.Connect();

			string pollsKey = meetingId + nameof(Poll);
			var polls = await _redisService.GetSetMembers<Poll>(pollsKey);
			var pollToDelete = polls.FirstOrDefault(poll => poll.Id.ToString() == pollId);
			await _redisService.DeleteSetMember(pollsKey, pollToDelete);

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			await connection.InvokeAsync("OnPollDeleted", meetingId, pollId);
		}

		public async Task SavePollResultsToDatabaseAndDeleteFromRedis(Guid meetingId)
		{
			_redisService.Connect();
			var polls = await _redisService.GetSetMembers<Poll>(meetingId + nameof(Poll));

			await _context.PollResults.AddRangeAsync(polls);
			await _context.SaveChangesAsync();
 
			await DeletePollsAndResultsFromRedis(meetingId, polls);
		}

		public async Task DeletePollsAndResultsFromRedis(Guid meetingId, IEnumerable<Poll> polls)
		{
			string key = meetingId + nameof(Poll);

			foreach (var poll in polls)
			{
				await _redisService.DeleteSetMember<Poll>(key, poll);
			}

			await _redisService.DeleteKey(meetingId + nameof(Poll));
		}
	}
}
