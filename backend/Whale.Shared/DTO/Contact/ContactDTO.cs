using System;
using Whale.Shared.DTO.Contact.Setting;
using Whale.Shared.DTO.DirectMessage;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.Contact
{
    public class ContactDTO
    {
        public Guid Id { get; set; }
        public Guid FirstMemberId { get; set; }
        public UserDTO FirstMember { get; set; }
        public Guid SecondMemberId { get; set; }
        public UserDTO SecondMember { get; set; }
        public DirectMessageDTO PinnedMessage { get; set; }
        public ContactSettingDTO Settings { get; set; }
        public ContactSettingDTO ContactnerSettings { get; set; }
    }
}
