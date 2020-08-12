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
			CreateMap<Poll, PollResultsDTO>()
				.ForMember(poll => poll.PollId, opt => opt.MapFrom(poll => poll.Id))
				.ForMember(poll => poll.Results, opt => opt.Ignore());
		}
	}
}
