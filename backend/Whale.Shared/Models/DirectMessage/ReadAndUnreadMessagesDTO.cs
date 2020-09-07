using System.Collections.Generic;

namespace Whale.Shared.Models.DirectMessage
{
    public class ReadAndUnreadMessagesDTO
	{
		public IEnumerable<DirectMessageDTO> ReadMessages { get; set; }
		public IEnumerable<DirectMessageDTO> UnreadMessages { get; set; }
	}
}
