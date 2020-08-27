
using System;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Models.User;

namespace Whale.Shared.Models.Contact
{
    public class ContactDTO
    {
        public Guid Id { get; set; }
        public Guid FirstMemberId { get; set; }
        public UserDTO FirstMember { get; set; }
        public Guid SecondMemberId { get; set; }
        public UserDTO SecondMember { get; set; }
        public DirectMessageDTO PinnedMessage { get; set; }
        public bool isAccepted { get; set; }
        public int UnreadMessageCount { get; set; }
    }
}
