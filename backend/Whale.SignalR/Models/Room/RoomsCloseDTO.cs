using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.SignalR.Models.Room
{
	public class RoomsCloseDTO
	{
		public IEnumerable<string> RoomIds { get; set; }
		public Guid MeetingId { get; set; }
		public string MeetingLink { get; set; }
	}
}
