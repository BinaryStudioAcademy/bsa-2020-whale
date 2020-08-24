using AutoMapper;
using Whale.DAL.Models.Poll;
using Whale.Shared.Models.Poll;

namespace Whale.Shared.MappingProfiles
{
	public class PollProfile: Profile
	{
		public PollProfile()
		{
			CreateMap<PollCreateDTO, Poll>()
				.ForMember(poll => poll.OptionResults, opt => opt.MapFrom(pollCreate => pollCreate.Options));

			CreateMap<OptionResult, string>().ConvertUsing(optionResult => optionResult.Option ?? string.Empty);

			CreateMap<string, OptionResult>()
				.ForMember(optionResult => optionResult.Option, opt => opt.MapFrom(option => option));

			CreateMap<Poll, PollDTO>()
				.ForMember(pDto => pDto.Options, opt => opt.MapFrom(p => p.OptionResults));
			CreateMap<PollDTO, Poll>()
				.ForMember(p => p.OptionResults, opt => opt.MapFrom(pDto => pDto.Options));

			CreateMap<Poll, PollResultDTO>()
				.ForMember(pollResult => pollResult.PollId, opt => opt.MapFrom(poll => poll.Id));
			CreateMap<PollResultDTO, Poll>()
				.ForMember(poll => poll.Id, opt => opt.MapFrom(pollResult => pollResult.PollId));

			CreateMap<VoteDTO, Vote>();

			CreateMap<Voter, VoterDTO>();
			CreateMap<VoterDTO, Voter>();

			CreateMap<OptionResult, OptionResultDTO>();
		}
	}
}
