using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.Poll
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
