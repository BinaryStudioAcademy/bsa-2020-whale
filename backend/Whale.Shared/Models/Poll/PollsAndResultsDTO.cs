
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class PollsAndResultsDTO
	{
		public ICollection<PollDTO> Polls { get; set; }
		public ICollection<PollResultDTO> Results { get; set; }
	}
}
