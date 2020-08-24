using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Email
{
	public class MeetingInviteDTO
	{
		public string MeetingLink { get; set; }
		public Guid MeetingId { get; set; }
		public Guid SenderId { get; set; }
		public IEnumerable<string> ReceiverEmails { get; set; }
	}
}
