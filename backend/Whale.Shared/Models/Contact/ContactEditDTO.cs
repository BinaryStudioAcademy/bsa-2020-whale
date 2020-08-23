using System;

namespace Whale.Shared.Models.Contact
{
    public class ContactEditDTO
    {
        public Guid Id { get; set; }
        public Guid PinnedMessageId { get; set; }
    }
}
