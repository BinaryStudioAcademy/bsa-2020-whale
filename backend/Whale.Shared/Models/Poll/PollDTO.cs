using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class PollDTO
	{
        public Guid Id { get; set; }
		public Guid MeetingId { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }

        public ICollection<string> Options { get; set; }
    }
}
