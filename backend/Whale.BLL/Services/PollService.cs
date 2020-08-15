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
			foreach (var option in pollEntity.Options)
			{
				var optionResult = new OptionResult
				{
					Option = option
				};
				emptyPollResult.OptionResults.Add(optionResult);
			}

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
				foreach (var optionResult in pollResult.OptionResults)
				{
					optionResult.VotedUsers = new List<Voter>();
				}
			}

			// signal
			await _meetingHub.Clients.Group(voteDto.MeetingId.ToString()).SendAsync("OnPollResults", pollResult);
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

			foreach(var result in resultsToSend)
			{
				if(result.IsAnonymous)
				{
					foreach(var optionResult in result.OptionResults)
					{
						optionResult.VotedUsers = new List<Voter>();
					}
				}
			}

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
	}
}

//var pollsAndResults = polls.Join(
//	pollResults,
//	poll => poll.Id,
//	pollResult => pollResult.PollId,
//	(poll, pollResult) => new
//	{
//		Poll = poll,
//		Result = pollResult
//	}
//);

//var pollsToSend = new List<Poll>();
//var resultsToSend = new List<PollResult>();
//int voteCount = 0;

//foreach (var pollAndResult in pollsAndResults)
//{
//	voteCount += pollAndResult.Result.OptionResults.Sum(optRes => optRes.VotedUsers.Count);

//	if(pollAndResult.Result.OptionResults.Any(optRes => optRes.VotedUsers.Any(user => user.Email == userEmail)))
//	{
//		resultsToSend.Add(pollAndResult.Result);
//	}
//	else
//	{
//		pollsToSend.Add(pollAndResult.Poll);
//	}
//}
