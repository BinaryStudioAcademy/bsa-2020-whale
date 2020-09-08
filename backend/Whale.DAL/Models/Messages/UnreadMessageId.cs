using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Messages
{
    public class UnreadMessageId : BaseEntity
	{
		public Guid MessageId { get; set; }
		public Guid ReceiverId { get; set; }
	}
}
