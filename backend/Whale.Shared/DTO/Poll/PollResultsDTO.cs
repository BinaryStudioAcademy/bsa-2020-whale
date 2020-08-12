using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollResultsDTO
	{
		public Guid PollId { get; set; }
		public string Title { get; set; }
		public bool IsAnonymous { get; set; }
		public int TotalVoted { get; set; }
		public Dictionary<string, int> Results { get; set; } = new Dictionary<string, int>();

	}
}
