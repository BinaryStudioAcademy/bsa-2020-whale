using System;
using Whale.Shared.Models.Contact.Setting;

namespace Whale.Shared.Models.Contact
{
    public class ContactEditDTO
    {
        public Guid Id { get; set; }
        public Guid PinnedMessageId { get; set; }
        public ContactSettingDTO Settings { get; set; }
    }
}
