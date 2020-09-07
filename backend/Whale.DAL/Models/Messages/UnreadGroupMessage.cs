using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Messages
{
    public class UnreadGroupMessage: BaseEntity

    {
        public Guid MessageId { get; set; }
        public Guid GroupId { get; set; }
        public Guid ReceiverId { get; set; }
    }
}
