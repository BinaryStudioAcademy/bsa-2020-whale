using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.Models.GroupMessage;

namespace Whale.Shared.Models.Group
{
    public class GroupDTO
    {
        public Guid Id { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public Guid PinnedMessageId { get; set; }
        public GroupMessageDTO PinnedMessage { get; set; }
    }
}
