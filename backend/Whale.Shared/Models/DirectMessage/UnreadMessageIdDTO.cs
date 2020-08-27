using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.DirectMessage
{
	public class UnreadMessageIdDTO
	{
		public Guid MessageId { get; set; }
		public Guid ReceiverId { get; set; }
	}
}
