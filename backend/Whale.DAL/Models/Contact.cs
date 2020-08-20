using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Contact : BaseEntity
    {
        public Guid FirstMemberId { get; set; }
        public User FirstMember { get; set; }
        public Guid SecondMemberId { get; set; }
        public User SecondMember { get; set; }
        public Guid? PinnedMessageId { get; set; }
        public DirectMessage PinnedMessage { get; set; }
        public ContactSetting FirstMemberSettings { get; set; }
        public ContactSetting SecondMemberSettings { get; set; }
        public bool isAccepted { get; set; }
    }
}