using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class VoteDTO
	{
		public PollDTO Poll { get; set; }
		public Guid MeetingId { get; set; }
		public string[] ChoosedOptions { get; set; }
		public VoterDTO User { get; set; }
	}
}
