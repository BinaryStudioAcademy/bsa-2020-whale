using System;
using Whale.Shared.DTO.Contact.Setting;
using Whale.Shared.DTO.DirectMessage;

namespace Whale.Shared.DTO.Contact
{
    public class ContactEditDTO
    {
        public Guid Id { get; set; }
        public Guid PinnedMessageId { get; set; }
        public ContactSettingDTO Settings { get; set; }
    }
}
