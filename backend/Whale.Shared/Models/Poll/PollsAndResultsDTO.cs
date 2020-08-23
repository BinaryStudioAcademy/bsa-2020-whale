
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class PollsAndResultsDTO
	{
		public IEnumerable<PollDTO> Polls { get; set; }
		public IEnumerable<PollResultDTO> Results { get; set; }
	}
}
