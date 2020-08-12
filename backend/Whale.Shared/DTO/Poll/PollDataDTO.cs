using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollDataDTO
	{
		public string UserId { get; set; }
		public string GroupId { get; set; }
		public PollDTO PollDto { get; set; }
	}
}
