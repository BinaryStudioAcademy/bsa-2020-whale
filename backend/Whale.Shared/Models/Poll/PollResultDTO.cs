using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class PollResultDTO
	{
		public string PollId { get; set; }
		public string Title { get; set; }
		public bool IsAnonymous { get; set; }
		public List<OptionResultDTO> OptionResults { get; set; }
		public int TotalVoted { get; set; }
		public int VoteCount { get; set; }
	}
}
