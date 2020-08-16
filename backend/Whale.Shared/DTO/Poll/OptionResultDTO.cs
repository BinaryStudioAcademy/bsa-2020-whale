using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.Poll
{
	public class OptionResultDTO
	{
		public string Option { get; set; }
		public int VoteCount { get; set; }
		public List<VoterDTO> VotedUsers { get; set; }
	}
}
