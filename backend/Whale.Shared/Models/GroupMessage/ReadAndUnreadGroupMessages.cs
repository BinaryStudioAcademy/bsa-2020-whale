using System.Collections.Generic;

namespace Whale.Shared.Models.GroupMessage
{
    public class ReadAndUnreadGroupMessages
    {
        public IEnumerable<GroupMessageDTO> ReadMessages { get; set; }
        public IEnumerable<GroupMessageDTO> UnreadMessages { get; set; }
    }
}
