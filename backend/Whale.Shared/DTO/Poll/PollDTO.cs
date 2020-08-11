using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollDTO
	{
        public Guid Id { get; set; }
		public Guid MeetingId { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }

        public string[] Answers { get; set; }
    }
}
