using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class PollResultDTO
	{
		public Guid PollId { get; set; }
		public string Title { get; set; }
		public bool IsAnonymous { get; set; }
		public IEnumerable<OptionResultDTO> OptionResults { get; set; }
		public IEnumerable<VoterDTO> VotedUsers { get; set; }
	}
}
