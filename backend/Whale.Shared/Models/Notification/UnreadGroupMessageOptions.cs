using System;
using System.Collections.Generic;
using Whale.DAL.Models.Messages;

namespace Whale.Shared.Models.Notification
{
    class UnreadGroupMessageOptions
    {
        public List<UnreadGroupMessage> UnreadGroupMessages { get; set; }
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
    }
}
