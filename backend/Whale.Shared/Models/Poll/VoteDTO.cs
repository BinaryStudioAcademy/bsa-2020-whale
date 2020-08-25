using System;
namespace Whale.Shared.Models.Poll
{
	public class VoteDTO
	{
		public Guid PollId { get; set; }
		public Guid MeetingId { get; set; }
		public string[] ChoosedOptions { get; set; }
		public VoterDTO User { get; set; }
	}
}
