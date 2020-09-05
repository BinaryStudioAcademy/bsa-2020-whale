using System;
using System.Collections.Generic;
using Whale.DAL.Models.Messages;

namespace Whale.Shared.Models.Notification
{
    public class UnreadMessageOptions
	{
		public List<UnreadMessageId> UnreadMessageIds { get; set; }
		public Guid ContactId { get; set; }
		public string SenderName { get; set; }
	}
}
