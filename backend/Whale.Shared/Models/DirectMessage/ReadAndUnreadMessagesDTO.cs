using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.DirectMessage
{
	public class ReadAndUnreadMessagesDTO
	{
		public IEnumerable<DirectMessageDTO> ReadMessages { get; set; }
		public IEnumerable<DirectMessageDTO> UnreadMessages { get; set; }
	}
}
