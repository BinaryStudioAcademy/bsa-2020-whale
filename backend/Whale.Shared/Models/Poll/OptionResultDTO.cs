
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class OptionResultDTO
	{
		public string Option { get; set; }
		public int VoteCount { get; set; }
		public List<VoterDTO> VotedUsers { get; set; }
	}
}
