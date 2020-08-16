using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollsAndResultsDTO
	{
		public ICollection<PollDTO> Polls { get; set; }
		public ICollection<PollResultDTO> Results { get; set; }
	}
}
