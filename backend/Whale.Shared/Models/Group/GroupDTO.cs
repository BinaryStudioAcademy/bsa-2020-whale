using System;
using Whale.Shared.Models.GroupMessage;

namespace Whale.Shared.Models.Group
{
    public class GroupDTO
    {
        public Guid Id { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public Guid? PinnedMessageId { get; set; }
        public GroupMessageDTO PinnedMessage { get; set; }
        public string CreatorEmail { get; set; }
        public string PhotoUrl { get; set; }
        public int UnreadMessageCount { get; set; }

    }
}
