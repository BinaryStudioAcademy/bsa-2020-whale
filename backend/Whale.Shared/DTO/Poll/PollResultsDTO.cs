using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollResultsDTO
	{
		public PollDTO PollDto { get; set; }
		public int[] Results { get; set; }

		public Dictionary<string, int> Results2 { get; set; } = new Dictionary<string, int>();
	}
}
