using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.Exceptions;
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
			if(!_context.Meetings.Any(meeting => meeting.Id == pollCreateDto.MeetingId))
			{
				throw new NotFoundException(nameof(Meeting));
			}

			Poll pollEntity = _mapper.Map<Poll>(pollCreateDto);
			pollEntity.Id = Guid.NewGuid();

			_redisService.Connect();
			await _redisService.AddToSet<Poll>(pollEntity.MeetingId.ToString() + nameof(Poll), pollEntity);

			var emptyPollResult = new PollResult
			{
				PollId = pollEntity.Id,
				Title = pollEntity.Title,
				IsAnonymous = pollEntity.IsAnonymous,
			};

			// fill emptyPollResult's OptionResults
			emptyPollResult.OptionResults = pollEntity.Options
				.Select(option => new OptionResult { Option = option })
				.ToList();

			await _redisService.AddToSet<PollResult>(pollEntity.MeetingId.ToString() + nameof(PollResult), emptyPollResult);

			var pollDto = _mapper.Map<PollDTO>(pollEntity);
			return pollDto;
		}

		public async Task SavePollAnswer(VoteDTO voteDto)
		{
			_redisService.Connect();

			var voteEntity = _mapper.Map<Vote>(voteDto);

			string resultSetKey = voteDto.MeetingId + nameof(PollResult);
			var pollResults = await _redisService.GetSetMembers<PollResult>(resultSetKey);
			var pollResult = pollResults.FirstOrDefault(result => result.PollId == voteDto.Poll.Id);

			await _redisService.DeleteSetMember<PollResult>(resultSetKey, pollResult);


			// include user's vote in OptionResults
			foreach(string choosedOption in voteDto.ChoosedOptions)
			{
				OptionResult optionResult = pollResult.OptionResults.FirstOrDefault(optResult => optResult.Option == choosedOption);
				optionResult.VotedUsers.Add(voteEntity.User);
				optionResult.VoteCount += 1;
			}

			pollResult.TotalVoted += 1;
			pollResult.VoteCount += voteDto.ChoosedOptions.Length;


			await _redisService.AddToSet<PollResult>(resultSetKey, pollResult);
			
			if (pollResult.IsAnonymous)
			{
				pollResult.OptionResults = pollResult.OptionResults.Select(optionResult => new OptionResult
				{
					Option = optionResult.Option,
					VoteCount = optionResult.VoteCount,
					VotedUsers = Enumerable.Empty<Voter>().ToList()
				}).ToList();
			}

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			await connection.InvokeAsync("OnPollResults", voteDto.MeetingId.ToString(), pollResult);
		}

		public async Task<PollsAndResultsDTO> GetPolls(string meetingId, string userEmail)
		{
			_redisService.Connect();

			var polls = await _redisService.GetSetMembers<Poll>(meetingId + nameof(Poll));
			var pollResults = await _redisService.GetSetMembers<PollResult>(meetingId + nameof(PollResult));


			var resultsToSend = pollResults
				.Where(pollResult => pollResult.OptionResults
				.Any(optRes => optRes.VotedUsers
				.Any(user => user.Email == userEmail))).ToList();

			//var anonResults = resultsToSend.Where(result => !result.IsAnonymous);
			//var nonAnonResults = resultsToSend.Except(anonResults);
			resultsToSend.ForEach(result =>
			{
				if (result.IsAnonymous)
				{
					result.OptionResults.ForEach(oR => oR.VotedUsers = new List<Voter>());
				}
			});

			//resultsToSend = anonResults.Concat(resultsToSend.Except(anonResults)).ToList();

			var pollsToSend = new List<Poll>();

			foreach (var poll in polls)
			{
				if(!resultsToSend.Any(result => result.PollId == poll.Id))
				{
					pollsToSend.Add(poll);
				}
			}

			var pollsAndResultsDTO = new PollsAndResultsDTO
			{
				Polls = _mapper.Map<ICollection<PollDTO>>(pollsToSend),
				Results = _mapper.Map<ICollection<PollResultDTO>>(resultsToSend),
			};

			return pollsAndResultsDTO;
		}

		public async Task DeletePoll(string meetingId, string pollId)
		{
			_redisService.Connect();

			string pollsKey = meetingId + nameof(Poll);
			string resultsKey = meetingId + nameof(PollResult);

			var polls = await _redisService.GetSetMembers<Poll>(pollsKey);
			var pollResults = await _redisService.GetSetMembers<PollResult>(resultsKey);

			var pollToDelete = polls.FirstOrDefault(poll => poll.Id.ToString() == pollId);
			var resultToDelete = pollResults.FirstOrDefault(result => result.PollId.ToString() == pollId);

			await _redisService.DeleteSetMember(pollsKey, pollToDelete);
			await _redisService.DeleteSetMember(resultsKey, resultToDelete);

			// signal
			var connection = await _signalrService.ConnectHubAsync("meeting");
			await connection.InvokeAsync("OnPollDeleted", meetingId, pollId);
		}

		public async Task SavePollResultsToDatabaseAndDeleteFromRedis(Guid meetingId)
		{
			_redisService.Connect();
			var pollResults = await _redisService.GetSetMembers<PollResult>(meetingId + nameof(PollResult));
			var polls = await _redisService.GetSetMembers<Poll>(meetingId + nameof(Poll));

			foreach (var result in pollResults)
			{
				result.MeetingId = meetingId;
			}
			await _context.PollResults.AddRangeAsync(pollResults);
			await _context.SaveChangesAsync();
 
			await DeletePollsAndResultsFromRedis(meetingId, polls, pollResults);
		}

		public async Task DeletePollsAndResultsFromRedis(Guid meetingId, ICollection<Poll> polls, ICollection<PollResult> pollResults)
		{
			var pollList = polls.ToList();
			var resultList = pollResults.ToList();

			foreach (int index in Enumerable.Range(0, polls.Count))
			{
				await _redisService.DeleteSetMember<Poll>(meetingId + nameof(Poll), pollList[index]);
				await _redisService.DeleteSetMember<PollResult>(meetingId + nameof(PollResult), resultList[index]);
			}

			await _redisService.DeleteKey(meetingId + nameof(Poll));
			await _redisService.DeleteKey(meetingId + nameof(PollResult));
		}
	}
}
