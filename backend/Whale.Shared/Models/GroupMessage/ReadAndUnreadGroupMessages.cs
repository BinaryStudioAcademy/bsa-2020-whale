using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.GroupMessage
{
    public class ReadAndUnreadGroupMessages
    {
        public IEnumerable<GroupMessageDTO> ReadMessages { get; set; }
        public IEnumerable<GroupMessageDTO> UnreadMessages { get; set; }
    }
}
