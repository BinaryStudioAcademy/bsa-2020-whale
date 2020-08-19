using AutoMapper;
using Whale.DAL.Models.Poll;
using Whale.Shared.Models.Poll;

namespace Whale.Shared.MappingProfiles
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
