using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.DTO.Poll;

namespace Whale.BLL.MappingProfiles
{
	public class PollProfile: Profile
	{
		public PollProfile()
		{
			CreateMap<PollCreateDTO, Poll>();
			CreateMap<Poll, PollDTO>();
			CreateMap<PollDTO, Poll>();
			CreateMap<PollResult, PollResultDTO>()
				.ForMember(
					pollResultDto => pollResultDto.OptionResults,
					pollResult => pollResult.MapFrom(pollResult => pollResult.OptionResults));
			CreateMap<VoteDTO, Vote>()
				.ForMember(vote => vote.PollId, voteDto => voteDto.MapFrom(voteDto => voteDto.Poll.Id));
			CreateMap<Voter, VoterDTO>();
			CreateMap<VoterDTO, Voter>();
			CreateMap<OptionResult, OptionResultDTO>();
		}
	}
}
