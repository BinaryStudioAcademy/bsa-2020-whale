using System;

namespace Whale.Shared.Models.Poll
{
	public class PollCreateDTO
	{
		public Guid MeetingId { get; set; }
		public string Title { get; set; }
		public bool IsAnonymous { get; set; }
		public bool IsSingleChoice { get; set; }

		public string[] Options { get; set; }
	}
}
