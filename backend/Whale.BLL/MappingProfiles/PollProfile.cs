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
			CreateMap<Poll, PollDTO>();
			CreateMap<PollDTO, Poll>();
		}
	}
}
