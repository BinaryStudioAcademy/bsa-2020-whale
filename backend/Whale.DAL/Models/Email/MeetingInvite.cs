using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.DAL.Models.Email
{
	public class MeetingInvite
	{
		public string MeetingLink { get; set; }
		public string SenderName { get; set; }
		public string ReceiverName { get; set; }
	}
}
